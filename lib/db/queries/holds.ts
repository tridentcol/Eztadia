import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingHoldRow = Database["public"]["Tables"]["booking_holds"]["Row"];

/**
 * Carga un booking_hold por id usando admin client (bypass RLS).
 *
 * El holdId en la URL `/p/[slug]/booking/[holdId]/pay` actua como bearer token
 * — UUIDv4 = 122 bits de entropia, suficiente para holds con TTL de 15min-24h.
 * Misma estrategia que Stripe checkout URLs.
 *
 * Returns null si no existe (caller decide 404).
 */
export async function getHoldById(holdId: string): Promise<BookingHoldRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("booking_holds")
    .select("*")
    .eq("id", holdId)
    .maybeSingle();

  if (error) throw mapDbError(error);
  return data;
}
