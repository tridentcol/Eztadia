import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
} from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

/** Cookie name para la propiedad activa del switcher multi-property (D13). */
export const ACTIVE_PROPERTY_COOKIE = "eztadia.active_property";

type ProfileRow      = Database["public"]["Tables"]["profiles"]["Row"];
type PropertyUserRow = Database["public"]["Tables"]["property_users"]["Row"];
type PropertyRole    = Database["public"]["Enums"]["PropertyUserRole"];

/**
 * Sesion + autorizacion centralizados.
 *
 * Patron: cada Server Component / Server Action que necesite auth llama una
 * de estas helpers. Tiran AppError (UnauthenticatedError, ForbiddenError) que
 * los callers traducen a redirect o response.
 *
 * react.cache() memoize por request → multiples llamadas en el mismo render
 * no re-pegan a Supabase.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
});

/**
 * Garantiza que hay user. Throw UnauthenticatedError si no.
 * Usar en Server Actions; en Server Components prefiere chequear y redirigir.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) throw new UnauthenticatedError();
  return profile;
}

/**
 * Garantiza que el user es member de la propiedad y retorna su rol.
 * Para super_admin retorna 'owner' efectivo.
 */
export const requireProperty = cache(async (propertyId: string): Promise<{
  user: { id: string };
  profile: ProfileRow;
  propertyRole: PropertyRole;
}> => {
  const profile = await requireProfile();

  if (profile.role === "super_admin") {
    return { user: { id: profile.id }, profile, propertyRole: "owner" };
  }

  const supabase = await createClient();
  const { data: link, error } = await supabase
    .from("property_users")
    .select("role, invitation_accepted_at")
    .eq("property_id", propertyId)
    .eq("user_id", profile.id)
    .maybeSingle<Pick<PropertyUserRow, "role" | "invitation_accepted_at">>();

  if (error) throw new ForbiddenError();
  if (!link) throw new ForbiddenError("No perteneces a esta propiedad.");
  if (!link.invitation_accepted_at) {
    throw new ForbiddenError("Tu invitacion aun no esta aceptada.");
  }

  return { user: { id: profile.id }, profile, propertyRole: link.role };
});

/**
 * Restringe a un rol minimo en la propiedad. owner > manager > reception.
 */
const ROLE_RANK: Record<PropertyRole, number> = {
  owner: 3,
  manager: 2,
  reception: 1,
};

export async function requirePropertyRole(
  propertyId: string,
  minRole: PropertyRole,
) {
  const ctx = await requireProperty(propertyId);
  if (ROLE_RANK[ctx.propertyRole] < ROLE_RANK[minRole]) {
    throw new ForbiddenError(`Necesitas rol ${minRole}+ en esta propiedad.`);
  }
  return ctx;
}

/** Super admin global (acceso a /admin). */
export async function requireSuperAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "super_admin") {
    throw new ForbiddenError("Solo super admin.");
  }
  return profile;
}

/**
 * Devuelve la primera propiedad del user (para flow flat sin switcher).
 * Si no tiene ninguna, fuerza /onboarding (caller decide).
 */
export const getFirstAccessibleProperty = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_users")
    .select("property_id")
    .eq("user_id", user.id)
    .not("invitation_accepted_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.property_id;
});

/**
 * Verifica que el user tiene acceso a una propiedad sin tirar errores
 * (a diferencia de requireProperty). Util para validar cookies persistidas.
 */
async function hasAccessToProperty(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (profile?.role === "super_admin") return true;

  const supabase = await createClient();
  const { data } = await supabase
    .from("property_users")
    .select("user_id")
    .eq("property_id", propertyId)
    .eq("user_id", userId)
    .not("invitation_accepted_at", "is", null)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Resuelve la propiedad activa del user para el dashboard multi-property.
 *
 * Orden:
 *   1. Cookie `eztadia.active_property` (validada contra membership actual)
 *   2. Fallback: primera propiedad accesible
 *
 * Si la cookie apunta a una propiedad a la que el user ya no pertenece
 * (revocaron acceso), se ignora silenciosamente y se usa el fallback.
 */
export const getActivePropertyId = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ACTIVE_PROPERTY_COOKIE)?.value;

  if (cookieValue && /^[0-9a-f-]{36}$/i.test(cookieValue)) {
    const ok = await hasAccessToProperty(user.id, cookieValue);
    if (ok) return cookieValue;
  }

  return getFirstAccessibleProperty();
});

/**
 * Lista propiedades accesibles del user actual (para el switcher).
 * Devuelve forma minimal usada por la UI; el caller no debe asumir mas.
 */
export const listAccessibleProperties = cache(async (): Promise<
  { id: string; name: string; slug: string; city: string | null }[]
> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug, city")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
});

/**
 * Resuelve el email de un user via admin client (cuando RLS no nos deja leerlo
 * — por ejemplo al listar invitaciones donde el profile no es accesible aun).
 */
export async function getUserEmailByIdAdmin(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) {
    if (error?.code === "PGRST116") throw new NotFoundError("Perfil");
    return null;
  }
  return data.email;
}
