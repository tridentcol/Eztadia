import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow  = Database["public"]["Tables"]["bookings"]["Row"];
type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type RoomRow     = Database["public"]["Tables"]["rooms"]["Row"];

export type BookingWithJoins = BookingRow & {
  room_types: Pick<RoomTypeRow, "id" | "name_es" | "name_en"> | null;
  rooms: Pick<RoomRow, "id" | "number"> | null;
};

export type BookingFilter = {
  status?: BookingRow["status"][];
  from?: string; // ISO date check_in >=
  to?: string;   // ISO date check_in <=
  limit?: number;
  cursor?: string; // ISO timestamp of created_at to paginate after
};

/**
 * Lista bookings de una propiedad. RLS scopes al user.
 */
export async function listBookings(
  propertyId: string,
  filter: BookingFilter = {},
): Promise<BookingWithJoins[]> {
  const supabase = await createClient();
  let q = supabase
    .from("bookings")
    .select("*, room_types(id, name_es, name_en), rooms(id, number)")
    .eq("property_id", propertyId);

  if (filter.status?.length) q = q.in("status", filter.status);
  if (filter.from) q = q.gte("check_in", filter.from);
  if (filter.to) q = q.lte("check_in", filter.to);
  if (filter.cursor) q = q.lt("created_at", filter.cursor);

  q = q.order("created_at", { ascending: false }).limit(filter.limit ?? 50);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  return (data ?? []) as unknown as BookingWithJoins[];
}

/**
 * Carga una booking por id (con joins).
 */
export async function getBooking(id: string): Promise<BookingWithJoins> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, room_types(id, name_es, name_en), rooms(id, number)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Reserva");
  return data as unknown as BookingWithJoins;
}

/**
 * Lookup publico por public_token (no requiere auth). Devuelve una vista
 * reducida — el cliente ve su reserva sin exponer datos internos.
 */
export async function getBookingByPublicToken(
  token: string,
): Promise<Pick<BookingRow,
  "id" | "code" | "check_in" | "check_out" | "nights" |
  "guest_full_name" | "total_cents" | "status" | "payment_method"
> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, code, check_in, check_out, nights, guest_full_name, total_cents, status, payment_method")
    .eq("public_token", token)
    .maybeSingle();

  if (error) throw mapDbError(error);
  return data;
}

/**
 * Stats agregadas para el overview del dashboard (proxima 7 dias).
 */
export type UpcomingCheckInsRow = Pick<BookingWithJoins,
  "id" | "code" | "check_in" | "guest_full_name" | "status"
> & { room_types: BookingWithJoins["room_types"]; rooms: BookingWithJoins["rooms"] };

export async function getUpcomingCheckIns(
  propertyId: string,
  days = 7,
): Promise<UpcomingCheckInsRow[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + days * 86400_000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select("id, code, check_in, guest_full_name, status, room_types(id, name_es, name_en), rooms(id, number)")
    .eq("property_id", propertyId)
    .in("status", ["confirmed", "pending_payment"])
    .gte("check_in", today)
    .lte("check_in", horizon)
    .order("check_in", { ascending: true })
    .limit(20);

  if (error) throw mapDbError(error);
  return (data ?? []) as unknown as UpcomingCheckInsRow[];
}
