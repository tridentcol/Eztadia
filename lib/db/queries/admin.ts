import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow  = Database["public"]["Tables"]["profiles"]["Row"];

export type GlobalStats = {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  bookings30d: number;
};

/**
 * Stats globales — solo accesibles a super_admin (RLS lo aplica).
 * Si el user actual no es admin, las count() devuelven 0 o las queries fallan.
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient();
  const since30d = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [usersR, propsR, bookingsR, recentR] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30d),
  ]);

  // Si algun count falla por permisos, devuelve 0 (no rompe la UI admin).
  return {
    totalUsers: usersR.count ?? 0,
    totalProperties: propsR.count ?? 0,
    totalBookings: bookingsR.count ?? 0,
    bookings30d: recentR.count ?? 0,
  };
}

export type AdminUserRow = Pick<ProfileRow,
  "id" | "email" | "full_name" | "role" | "created_at"
>;

/**
 * Lista users del sistema (paginado). Solo super_admin via RLS.
 */
export async function listAdminUsers(opts: {
  limit?: number;
  cursor?: string; // ISO timestamp para keyset pagination
  search?: string;
} = {}): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at");

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`email.ilike.%${s}%,full_name.ilike.%${s}%`);
  }
  if (opts.cursor) q = q.lt("created_at", opts.cursor);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 50);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  return data ?? [];
}
