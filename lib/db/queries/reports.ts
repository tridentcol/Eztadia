import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

/**
 * Reportes operativos del owner. Convención de atribución:
 * un booking se contabiliza en el período donde cae su `check_in`
 * (booking-date method). Es estándar y mantiene queries simples; si más
 * adelante se necesita stay-night attribution (pro-rateo por noche real)
 * se reescribe en SQL con generate_series.
 *
 * Estados contabilizados como "vendidos": `confirmed` y `completed`.
 * `pending_payment`, `cancelled` y `no_show` quedan fuera (no produjeron
 * ingreso ni ocupación real).
 */

const REALIZED_STATUSES: BookingRow["status"][] = ["confirmed", "completed"];

export type ReportMetrics = {
  bookings: number;
  nights: number;
  revenueCents: number;
  adrCents: number;        // revenue / nights
  occupancyPct: number;    // nights / (activeRooms × daysInPeriod)
  revparCents: number;     // revenue / (activeRooms × daysInPeriod)
  avgLeadDays: number;     // promedio entre created_at y check_in
  avgStayNights: number;   // promedio de nights
  activeRooms: number;
  daysInPeriod: number;
};

/**
 * Métricas agregadas de un período (semi-abierto: `from <= check_in < to`).
 */
export async function getReportMetrics(
  propertyId: string,
  from: string, // ISO date YYYY-MM-DD inclusive
  to: string,   // ISO date YYYY-MM-DD exclusive
): Promise<ReportMetrics> {
  const supabase = await createClient();

  const [bookingsR, roomsR] = await Promise.all([
    supabase
      .from("bookings")
      .select("nights, total_cents, check_in, created_at")
      .eq("property_id", propertyId)
      .in("status", REALIZED_STATUSES)
      .gte("check_in", from)
      .lt("check_in", to),
    supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .eq("is_active", true),
  ]);

  if (bookingsR.error) throw mapDbError(bookingsR.error);
  if (roomsR.error) throw mapDbError(roomsR.error);

  const rows = bookingsR.data ?? [];
  const activeRooms = roomsR.count ?? 0;
  const daysInPeriod = daysBetweenIso(from, to);

  const bookings = rows.length;
  let nights = 0;
  let revenueCents = 0;
  let leadDaysSum = 0;
  for (const r of rows) {
    nights += r.nights ?? 0;
    revenueCents += r.total_cents;
    leadDaysSum += daysBetweenIso(
      r.created_at.slice(0, 10),
      r.check_in,
    );
  }

  const denomNightsAvailable = activeRooms * daysInPeriod;

  return {
    bookings,
    nights,
    revenueCents,
    adrCents: nights > 0 ? Math.round(revenueCents / nights) : 0,
    occupancyPct:
      denomNightsAvailable > 0
        ? Math.round((nights / denomNightsAvailable) * 1000) / 10
        : 0,
    revparCents:
      denomNightsAvailable > 0
        ? Math.round(revenueCents / denomNightsAvailable)
        : 0,
    avgLeadDays: bookings > 0 ? Math.round(leadDaysSum / bookings) : 0,
    avgStayNights:
      bookings > 0 ? Math.round((nights / bookings) * 10) / 10 : 0,
    activeRooms,
    daysInPeriod,
  };
}

export type MonthlyRevenuePoint = {
  monthIso: string; // YYYY-MM-01
  revenueCents: number;
  bookings: number;
  nights: number;
};

/**
 * Serie mensual de revenue + bookings + nights para el chart.
 * Devuelve `months` cubetas consecutivas terminando con el mes actual.
 */
export async function getRevenueByMonth(
  propertyId: string,
  months: number,
): Promise<MonthlyRevenuePoint[]> {
  const supabase = await createClient();

  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
  const endExclusive = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const from = isoUtcDate(startMonth);
  const to = isoUtcDate(endExclusive);

  const { data, error } = await supabase
    .from("bookings")
    .select("nights, total_cents, check_in")
    .eq("property_id", propertyId)
    .in("status", REALIZED_STATUSES)
    .gte("check_in", from)
    .lt("check_in", to);

  if (error) throw mapDbError(error);

  const buckets = new Map<string, MonthlyRevenuePoint>();
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + i, 1));
    const key = isoUtcDate(d);
    buckets.set(key, { monthIso: key, revenueCents: 0, bookings: 0, nights: 0 });
  }

  for (const r of data ?? []) {
    const ci = r.check_in;
    const key = `${ci.slice(0, 7)}-01`;
    const b = buckets.get(key);
    if (!b) continue;
    b.revenueCents += r.total_cents;
    b.nights += r.nights ?? 0;
    b.bookings += 1;
  }

  return Array.from(buckets.values());
}

export type RoomTypeBreakdownRow = {
  roomTypeId: string;
  nameEs: string;
  bookings: number;
  nights: number;
  revenueCents: number;
  adrCents: number;
};

/**
 * Breakdown del período por room_type (no por habitación física —
 * el shape estable es room_type, las rooms físicas pueden cambiar).
 */
export async function getBreakdownByRoomType(
  propertyId: string,
  from: string,
  to: string,
): Promise<RoomTypeBreakdownRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("nights, total_cents, room_type_id, room_types(id, name_es)")
    .eq("property_id", propertyId)
    .in("status", REALIZED_STATUSES)
    .gte("check_in", from)
    .lt("check_in", to);

  if (error) throw mapDbError(error);

  type Row = {
    nights: number | null;
    total_cents: number;
    room_type_id: string;
    room_types: { id: string; name_es: string } | null;
  };

  const grouped = new Map<string, RoomTypeBreakdownRow>();
  for (const r of (data ?? []) as unknown as Row[]) {
    const id = r.room_type_id;
    const name = r.room_types?.name_es ?? "(sin tipo)";
    const cur =
      grouped.get(id) ??
      {
        roomTypeId: id,
        nameEs: name,
        bookings: 0,
        nights: 0,
        revenueCents: 0,
        adrCents: 0,
      };
    cur.bookings += 1;
    cur.nights += r.nights ?? 0;
    cur.revenueCents += r.total_cents;
    grouped.set(id, cur);
  }

  for (const row of grouped.values()) {
    row.adrCents = row.nights > 0 ? Math.round(row.revenueCents / row.nights) : 0;
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenueCents - a.revenueCents,
  );
}

export type SourceBreakdownRow = {
  source: Database["public"]["Enums"]["BookingSource"];
  bookings: number;
  nights: number;
  revenueCents: number;
};

/**
 * Cuántos bookings vienen de qué canal: direct (página propia), booking_com,
 * airbnb, manual (cargados a mano). Crítico para entender dependencia de OTAs.
 */
export async function getBreakdownBySource(
  propertyId: string,
  from: string,
  to: string,
): Promise<SourceBreakdownRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("source, total_cents, nights")
    .eq("property_id", propertyId)
    .in("status", REALIZED_STATUSES)
    .gte("check_in", from)
    .lt("check_in", to);

  if (error) throw mapDbError(error);

  const grouped = new Map<
    Database["public"]["Enums"]["BookingSource"],
    SourceBreakdownRow
  >();
  for (const r of data ?? []) {
    const cur =
      grouped.get(r.source) ??
      { source: r.source, bookings: 0, nights: 0, revenueCents: 0 };
    cur.bookings += 1;
    cur.nights += r.nights ?? 0;
    cur.revenueCents += r.total_cents;
    grouped.set(r.source, cur);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenueCents - a.revenueCents,
  );
}

export type PaymentMethodBreakdownRow = {
  method: Database["public"]["Enums"]["PaymentMethod"];
  bookings: number;
  revenueCents: number;
};

/**
 * Cuántos bookings se cobraron por qué medio (pse, transferencia, etc).
 * Util para entender mix de pagos del período.
 */
export async function getBreakdownByPaymentMethod(
  propertyId: string,
  from: string,
  to: string,
): Promise<PaymentMethodBreakdownRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("payment_method, total_cents")
    .eq("property_id", propertyId)
    .in("status", REALIZED_STATUSES)
    .gte("check_in", from)
    .lt("check_in", to);

  if (error) throw mapDbError(error);

  const grouped = new Map<
    Database["public"]["Enums"]["PaymentMethod"],
    PaymentMethodBreakdownRow
  >();
  for (const r of data ?? []) {
    const cur =
      grouped.get(r.payment_method) ??
      { method: r.payment_method, bookings: 0, revenueCents: 0 };
    cur.bookings += 1;
    cur.revenueCents += r.total_cents;
    grouped.set(r.payment_method, cur);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.revenueCents - a.revenueCents,
  );
}

/** Días entre dos fechas ISO (YYYY-MM-DD), half-open. */
function daysBetweenIso(fromIso: string, toIso: string): number {
  const a = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const b = Date.UTC(
    Number(toIso.slice(0, 4)),
    Number(toIso.slice(5, 7)) - 1,
    Number(toIso.slice(8, 10)),
  );
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function isoUtcDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

export type ReportBookingExport = {
  code: string;
  status: BookingRow["status"];
  source: BookingRow["source"];
  checkIn: string;
  checkOut: string;
  nights: number;
  guestFullName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  adults: number;
  children: number;
  totalCents: number;
  paymentMethod: BookingRow["payment_method"];
  roomTypeName: string;
  roomNumber: string | null;
  createdAt: string;
};

/**
 * Lista bookings del período con joins para CSV export. Mismo filtro que
 * `getReportMetrics` — atribución por `check_in` cae en `[from, to)`,
 * estados `confirmed + completed`.
 */
export async function getReportBookingsForExport(
  propertyId: string,
  from: string,
  to: string,
): Promise<ReportBookingExport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `code, status, source, check_in, check_out, nights,
       guest_full_name, guest_email, guest_phone, guest_country,
       adults, children, total_cents, payment_method, created_at,
       room_type:room_types(name_es),
       room:rooms(number)`,
    )
    .eq("property_id", propertyId)
    .in("status", REALIZED_STATUSES)
    .gte("check_in", from)
    .lt("check_in", to)
    .order("check_in", { ascending: true });

  if (error) throw mapDbError(error);

  type Row = {
    code: string;
    status: BookingRow["status"];
    source: BookingRow["source"];
    check_in: string;
    check_out: string;
    nights: number | null;
    guest_full_name: string;
    guest_email: string;
    guest_phone: string;
    guest_country: string;
    adults: number;
    children: number;
    total_cents: number;
    payment_method: BookingRow["payment_method"];
    created_at: string;
    room_type: { name_es: string } | null;
    room: { number: string } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    code: r.code,
    status: r.status,
    source: r.source,
    checkIn: r.check_in,
    checkOut: r.check_out,
    nights: r.nights ?? 0,
    guestFullName: r.guest_full_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    guestCountry: r.guest_country,
    adults: r.adults,
    children: r.children,
    totalCents: r.total_cents,
    paymentMethod: r.payment_method,
    roomTypeName: r.room_type?.name_es ?? "—",
    roomNumber: r.room?.number ?? null,
    createdAt: r.created_at,
  }));
}
