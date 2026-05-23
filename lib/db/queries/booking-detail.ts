import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

/**
 * Carga el ultimo payment de una booking (mas reciente, sin filtrar status).
 */
export async function getLatestBookingPayment(
  bookingId: string,
): Promise<PaymentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
}

/**
 * Audit logs de una booking (resource_type='booking' y resource_id=bookingId),
 * ordenado descendente para timeline.
 */
export async function getBookingAuditLogs(
  bookingId: string,
  limit = 25,
): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .in("resource_type", ["booking", "booking_hold", "payment"])
    .eq("resource_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw mapDbError(error);
  return data ?? [];
}

/**
 * Carga el room (con floor) si la booking tiene room_id.
 */
export async function getRoomById(
  roomId: string,
): Promise<Pick<RoomRow, "id" | "floor"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, floor")
    .eq("id", roomId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
}
