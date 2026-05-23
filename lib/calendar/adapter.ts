import "server-only";
import type {
  BookingStatus as DemoBookingStatus,
  CalendarBooking,
  CalendarMonth,
  RoomGroup,
} from "@/lib/calendar";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type ExternalBlockRow = Database["public"]["Tables"]["external_blocks"]["Row"];

const DOW_ABBR = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export type MonthDataInput = {
  year: number;
  month: number; // 1..12
  todayIso: string; // YYYY-MM-DD
  rooms: RoomRow[];
  roomTypes: RoomTypeRow[];
  bookings: (BookingRow & {
    rooms: Pick<RoomRow, "id" | "number"> | null;
  })[];
  externalBlocks: (ExternalBlockRow & {
    rooms: Pick<RoomRow, "id" | "number"> | null;
  })[];
};

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function dayOfWeekIso(iso: string): number {
  // 0=Sunday
  return new Date(iso + "T00:00:00Z").getUTCDay();
}

function clampToMonth(
  checkInIso: string,
  checkOutIso: string,
  year: number,
  month: number,
): { start: number; end: number } | null {
  const monthStartTs = Date.UTC(year, month - 1, 1);
  const monthEndTs = Date.UTC(year, month, 0); // last day
  const inTs = new Date(checkInIso + "T00:00:00Z").getTime();
  const outTs = new Date(checkOutIso + "T00:00:00Z").getTime();
  // Sin overlap → null
  if (outTs <= monthStartTs) return null;
  if (inTs > monthEndTs) return null;
  const start = inTs < monthStartTs ? 1 : new Date(inTs).getUTCDate();
  const endDate = outTs > monthEndTs ? new Date(monthEndTs).getUTCDate() + 1 : new Date(outTs).getUTCDate();
  return { start, end: endDate };
}

function statusFromBooking(status: BookingRow["status"]): DemoBookingStatus | null {
  if (status === "confirmed") return "confirmed";
  if (status === "pending_payment") return "pending";
  if (status === "completed") return "confirmed";
  // cancelled / no_show no se pintan
  return null;
}

function shortCode(id: string): string {
  return `EZT-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function groupByRoomType(rooms: RoomRow[], types: RoomTypeRow[]): RoomGroup[] {
  const typeById = new Map(types.map((t) => [t.id, t]));
  // Group rooms by their room_type_id, preserving room_type order by base_price
  const ordered = [...types]
    .filter((t) => t.is_active)
    .sort((a, b) => b.base_price_cents - a.base_price_cents);
  const buckets = new Map<string, RoomRow[]>();
  for (const r of rooms) {
    if (!r.is_active) continue;
    if (!buckets.has(r.room_type_id)) buckets.set(r.room_type_id, []);
    buckets.get(r.room_type_id)!.push(r);
  }
  const out: RoomGroup[] = [];
  for (const t of ordered) {
    const list = buckets.get(t.id);
    if (!list || list.length === 0) continue;
    list.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    out.push({
      // El demo usa keys literales pero React solo necesita unicidad — el id sirve.
      key: t.id as unknown as RoomGroup["key"],
      label: t.name_es.toUpperCase() as unknown as RoomGroup["label"],
      rooms: list.map((r) => ({ number: r.number, type: t.name_es })),
    });
  }
  return out;
}

/**
 * Convierte queries reales (bookings + holds + external_blocks + rooms +
 * room_types) en el `CalendarMonth` que esperan los componentes del calendar
 * (sin tocar visual layer — Phase A primitives).
 *
 * Bookings sin room asignada se omiten del timeline por habitacion (se
 * mostraran cuando el staff asigne room).
 *
 * `today` es el dia del mes si el mes activo === mes/anio actual; sino se setea
 * a 0 (los componentes solo lo usan para resaltar "hoy" — no rompe si no es 0).
 */
export function buildCalendarMonth(input: MonthDataInput): CalendarMonth {
  const { year, month, todayIso, rooms, roomTypes, bookings, externalBlocks } = input;
  const dim = daysInMonth(year, month);
  const firstDow = dayOfWeekIso(`${year}-${String(month).padStart(2, "0")}-01`);
  const dow: string[] = [];
  for (let i = 0; i < dim; i++) dow.push(DOW_ABBR[(firstDow + i) % 7]);

  const todayDate = new Date(todayIso + "T00:00:00Z");
  const today =
    todayDate.getUTCFullYear() === year && todayDate.getUTCMonth() + 1 === month
      ? todayDate.getUTCDate()
      : 0;

  const groups = groupByRoomType(rooms, roomTypes);
  const totalRooms = groups.reduce((s, g) => s + g.rooms.length, 0);

  const calBookings: CalendarBooking[] = [];

  for (const b of bookings) {
    if (!b.rooms?.number) continue; // sin room asignada → skip
    const status = statusFromBooking(b.status);
    if (!status) continue;
    const span = clampToMonth(b.check_in, b.check_out, year, month);
    if (!span) continue;
    const surname = b.guest_full_name.split(" ").slice(-1)[0];
    calBookings.push({
      id: b.id,
      room: b.rooms.number,
      start: span.start,
      end: span.end,
      status,
      surname,
      name: b.guest_full_name,
      guests: (b.adults ?? 0) + (b.children ?? 0) || undefined,
      total: Math.round(b.total_cents / 100),
      pay:
        b.payment_method === "pse"
          ? "PSE"
          : b.payment_method === "manual_transfer"
            ? "Transferencia"
            : "Manual",
      code: b.code || shortCode(b.id),
      // Sin payment_due_at en schema actual → no marcamos urgent. Deuda
      // conocida: agregar columna o derivar de created_at + ttl politica.
      urgent: false,
      todayCheckin: today > 0 && span.start === today,
    });
  }

  for (const eb of externalBlocks) {
    if (!eb.rooms?.number) continue;
    const span = clampToMonth(eb.start_date, eb.end_date, year, month);
    if (!span) continue;
    // external_blocks no diferencia "manual" de "OTA" por ahora — todos vienen
    // de ical_feeds. Source visible vendria de joinear ical_feeds.name; por
    // ahora todos como external sin source label.
    calBookings.push({
      id: eb.id,
      room: eb.rooms.number,
      start: span.start,
      end: span.end,
      status: "external",
      label: eb.summary ?? undefined,
    });
  }

  // Occupancy: dias x habitaciones ocupados / (dim * totalRooms) * 100
  let occupiedDays = 0;
  for (const cb of calBookings) {
    occupiedDays += Math.max(0, cb.end - cb.start);
  }
  const occupancyPercent =
    totalRooms === 0 || dim === 0
      ? 0
      : Math.round((occupiedDays / (dim * totalRooms)) * 100);

  return {
    year,
    month,
    daysInMonth: dim,
    today,
    dow,
    totalRooms,
    occupancyPercent,
    groups,
    bookings: calBookings,
  };
}
