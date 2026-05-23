import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PropertyUserRow = Database["public"]["Tables"]["property_users"]["Row"];
type ProfileRow      = Database["public"]["Tables"]["profiles"]["Row"];

export type StaffMember = PropertyUserRow & {
  profiles: Pick<ProfileRow, "id" | "email" | "full_name" | "avatar_url" | "phone"> | null;
};

/**
 * Lista miembros (staff) de una propiedad. RLS scopea: solo members la ven.
 * Incluye perfil basico para mostrar en UI.
 */
export async function listStaff(propertyId: string): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_users")
    .select("*, profiles(id, email, full_name, avatar_url, phone)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) throw mapDbError(error);
  return (data ?? []) as unknown as StaffMember[];
}
