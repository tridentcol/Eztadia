import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ConflictError, ForbiddenError, mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

/**
 * Crea una propiedad bajo una organizacion del user actual. RLS exige que
 * el user sea owner de la organization referenciada.
 *
 * Crea tambien el property_user (owner) en el mismo flow — para que el
 * creador sea miembro inmediatamente.
 */
export async function createProperty(input: {
  organizationId: string;
  slug: string;
  name: string;
  city?: string;
  address?: string;
}): Promise<PropertyRow> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new ForbiddenError();

  const payload: PropertyInsert = {
    organization_id: input.organizationId,
    slug: input.slug,
    name: input.name,
    city: input.city ?? null,
    address: input.address ?? null,
  };

  const { data, error } = await supabase
    .from("properties")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") throw new ConflictError("Esa URL publica ya esta tomada. Prueba con otra.");
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Propiedad");

  // Auto-vincular creador como owner.
  const { error: linkErr } = await supabase.from("property_users").insert({
    property_id: data.id,
    user_id: user.id,
    role: "owner",
    invited_by: user.id,
    invitation_accepted_at: new Date().toISOString(),
  });
  if (linkErr) throw mapDbError(linkErr);

  return data;
}

export async function updateProperty(
  id: string,
  patch: PropertyUpdate,
): Promise<PropertyRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") throw new ConflictError("Esa URL publica ya esta tomada. Prueba con otra.");
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Propiedad");
  return data;
}
