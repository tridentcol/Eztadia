import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ConflictError,
  ForbiddenError,
  mapDbError,
  NotFoundError,
} from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PropertyUserRow = Database["public"]["Tables"]["property_users"]["Row"];
type PropertyUserRole = Database["public"]["Enums"]["PropertyUserRole"];

/**
 * Invita a un staff a una propiedad por email.
 *
 * Flujo:
 *   1. Busca profile por email (no expone si no existe — usa admin client
 *      para circumventar RLS que requeriria knowledge previo).
 *   2. Si no existe profile → invita al user a registrarse via Supabase Auth
 *      inviteUserByEmail (manda link). El trigger handle_new_user creara
 *      profile al confirmar.
 *   3. Inserta row en property_users con invitation_accepted_at = NULL para
 *      que el invitado deba aceptar al hacer login.
 *
 * Solo owner puede llamar (RLS lo aplica en INSERT a property_users).
 */
export async function inviteStaff(args: {
  propertyId: string;
  email: string;
  role: PropertyUserRole;
}): Promise<PropertyUserRow> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user: inviter } } = await supabase.auth.getUser();
  if (!inviter) throw new ForbiddenError();

  // 1. Resolver user_id del invitado por email (admin bypassa RLS de profiles).
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id")
    .eq("email", args.email)
    .maybeSingle();
  if (profileErr) throw mapDbError(profileErr);

  let userId = profile?.id;

  // 2. Si no existe, mandar invitacion (crea auth.users + dispara trigger).
  if (!userId) {
    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      args.email,
    );
    if (inviteErr || !invite.user) {
      throw new ForbiddenError("No pudimos enviar la invitacion.");
    }
    userId = invite.user.id;
  }

  // 3. Insertar property_user pendiente de aceptacion.
  const { data, error } = await supabase
    .from("property_users")
    .insert({
      property_id: args.propertyId,
      user_id: userId,
      role: args.role,
      invited_by: inviter.id,
      invitation_accepted_at: null,
    })
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ConflictError("Ese usuario ya es miembro de la propiedad.");
    }
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Invitacion");
  return data;
}

export async function updateStaffRole(args: {
  propertyUserId: string;
  role: PropertyUserRole;
}): Promise<PropertyUserRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_users")
    .update({ role: args.role })
    .eq("id", args.propertyUserId)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Miembro");
  return data;
}

export async function removeStaff(propertyUserId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_users")
    .delete()
    .eq("id", propertyUserId);
  if (error) throw mapDbError(error);
}

/**
 * Marca una invitacion como aceptada (el invitado entra por primera vez).
 * RLS permite UPDATE si user_id = auth.uid().
 */
export async function acceptInvitation(propertyUserId: string): Promise<PropertyUserRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_users")
    .update({ invitation_accepted_at: new Date().toISOString() })
    .eq("id", propertyUserId)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Invitacion");
  return data;
}
