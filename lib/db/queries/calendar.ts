import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type ExternalBlockRow = Database["public"]["Tables"]["external_blocks"]["Row"];

export type CalendarData = {
  rooms: RoomRow[];
  roomTypes: RoomTypeRow[];
  bookings: (BookingRow & { rooms: Pick<RoomRow, "id" | "number"> | null })[];
  externalBlocks: (ExternalBlockRow & { rooms: Pick<RoomRow, "id" | "number"> | null })[];
};

/**
 * Trae todo lo necesario para pintar el calendar de un mes: rooms + types
 * activos + bookings que solapan + external_blocks que solapan.
 *
 * Filtra por overlap clásico: check_in < monthEnd AND check_out > monthStart.
 */
export async function getCalendarData(args: {
  propertyId: string;
  year: number;
  month: number; // 1..12
}): Promise<CalendarData> {
  const monthStart = `${args.year}-${String(args.month).padStart(2, "0")}-01`;
  const nextMonth = args.month === 12 ? 1 : args.month + 1;
  const nextYear = args.month === 12 ? args.year + 1 : args.year;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const supabase = await createClient();

  const [roomsRes, typesRes, bookingsRes, blocksRes] = await Promise.all([
    supabase
      .from("rooms")
      .select("*")
      .eq("property_id", args.propertyId)
      .eq("is_active", true)
      .order("number", { ascending: true }),
    supabase
      .from("room_types")
      .select("*")
      .eq("property_id", args.propertyId)
      .eq("is_active", true)
      .order("base_price_cents", { ascending: false }),
    supabase
      .from("bookings")
      .select("*, rooms(id, number)")
      .eq("property_id", args.propertyId)
      .lt("check_in", monthEnd)
      .gt("check_out", monthStart)
      .not("status", "in", "(cancelled,no_show,refunded)"),
    supabase
      .from("external_blocks")
      .select("*, rooms(id, number)")
      .eq("property_id", args.propertyId)
      .lt("start_date", monthEnd)
      .gt("end_date", monthStart),
  ]);

  if (roomsRes.error) throw mapDbError(roomsRes.error);
  if (typesRes.error) throw mapDbError(typesRes.error);
  if (bookingsRes.error) throw mapDbError(bookingsRes.error);
  if (blocksRes.error) throw mapDbError(blocksRes.error);

  return {
    rooms: roomsRes.data ?? [],
    roomTypes: typesRes.data ?? [],
    bookings: (bookingsRes.data ?? []) as unknown as CalendarData["bookings"],
    externalBlocks: (blocksRes.data ?? []) as unknown as CalendarData["externalBlocks"],
  };
}
