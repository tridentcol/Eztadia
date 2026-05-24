import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import { getReportMetrics } from "./reports";
import type { AttentionItem, CheckIn, WeekMetric } from "@/lib/dashboard";
import type { Database } from "@/lib/supabase/database.types";

type BookingStatus = Database["public"]["Enums"]["BookingStatus"];

/**
 * Week-to-date pulse metrics. Reusa getReportMetrics con rango lunes→hoy+1.
 * Omitimos `response-time` (depende de WhatsApp E2). Devolvemos 3 métricas
 * canónicas: ocupación, reservas confirmadas, ingresos.
 *
 * Comparación vs semana anterior: corremos getReportMetrics 2 veces (esta
 * semana, semana pasada) y derivamos changeLabel para ocupación.
 */
export async function getWeekPulseMetrics(
  propertyId: string,
): Promise<WeekMetric[]> {
  const now = new Date();
  const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Monday-anchored week: getUTCDay() returns 0=Sun..6=Sat; shift so Monday=0.
  const dayOfWeek = (utcToday.getUTCDay() + 6) % 7;
  const weekStart = new Date(utcToday.getTime() - dayOfWeek * 86_400_000);
  const weekEndExclusive = new Date(utcToday.getTime() + 86_400_000);
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 86_400_000);

  const [thisWeek, lastWeek] = await Promise.all([
    getReportMetrics(propertyId, iso(weekStart), iso(weekEndExclusive)),
    getReportMetrics(propertyId, iso(prevWeekStart), iso(weekStart)),
  ]);

  const occChange = thisWeek.occupancyPct - lastWeek.occupancyPct;
  const occChangeLabel =
    occChange === 0
      ? "Igual que sem. pasada"
      : `${occChange > 0 ? "↑" : "↓"} ${Math.abs(occChange).toFixed(1)} pp vs sem. pasada`;

  const out: WeekMetric[] = [
    {
      kind: "occupancy",
      label: "Ocupación",
      value: Math.round(thisWeek.occupancyPct),
      changeLabel: occChangeLabel,
      tone: occChange >= 0 ? "up" : "down",
    },
    {
      kind: "bookings",
      label: "Reservas confirmadas",
      value: thisWeek.bookings,
      breakdown:
        thisWeek.bookings === 0
          ? "0 esta semana"
          : `${thisWeek.bookings} ${thisWeek.bookings === 1 ? "reserva" : "reservas"}`,
    },
    {
      kind: "revenue",
      label: "Ingresos confirmados",
      valueCOP: Math.round(thisWeek.revenueCents / 100),
      footnote: "COP · esta semana",
    },
  ];
  return out;
}

/**
 * Atención que pide el owner: reservas pendientes de pago hace >1h
 * y check-ins de hoy. WhatsApp-pending se omite hasta Phase E2.
 *
 * Cap a 5 items totales para mantener el panel digerible.
 *
 * `propertyCheckInTime` (HH:MM o HH:MM:SS) se usa para calcular `hoursAway`
 * y mostrar la hora real de check-in. Sin esto, defaultea a 15:00.
 */
export async function getAttentionItems(
  propertyId: string,
  propertyCheckInTime?: string | null,
): Promise<AttentionItem[]> {
  const supabase = await createClient();
  const now = new Date();
  const today = iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const checkInTimeLabel = formatCheckInTimeLabel(propertyCheckInTime);

  const [pendingR, todayR] = await Promise.all([
    // Pagos pendientes con >1h de antigüedad — el host debería revisarlos.
    supabase
      .from("bookings")
      .select(
        "id, guest_full_name, check_in, check_out, total_cents, created_at, room_types(name_es), rooms(number)",
      )
      .eq("property_id", propertyId)
      .eq("status", "pending_payment" satisfies BookingStatus)
      .lt("created_at", oneHourAgo)
      .order("created_at", { ascending: true })
      .limit(5),
    // Check-ins programados para hoy (confirmados).
    supabase
      .from("bookings")
      .select(
        "id, guest_full_name, adults, children, check_in, guest_phone, room_types(name_es), rooms(number)",
      )
      .eq("property_id", propertyId)
      .eq("status", "confirmed" satisfies BookingStatus)
      .eq("check_in", today)
      .order("created_at", { ascending: true })
      .limit(3),
  ]);

  if (pendingR.error) throw mapDbError(pendingR.error);
  if (todayR.error) throw mapDbError(todayR.error);

  type PendingRow = {
    id: string;
    guest_full_name: string;
    check_in: string;
    check_out: string;
    total_cents: number;
    created_at: string;
    room_types: { name_es: string } | null;
    rooms: { number: string } | null;
  };
  type TodayRow = {
    id: string;
    guest_full_name: string;
    adults: number;
    children: number;
    check_in: string;
    guest_phone: string;
    room_types: { name_es: string } | null;
    rooms: { number: string } | null;
  };

  const items: AttentionItem[] = [];

  for (const r of (todayR.data ?? []) as unknown as TodayRow[]) {
    const party = r.adults + r.children;
    items.push({
      kind: "checkin-today",
      id: r.id,
      guestName: r.guest_full_name,
      guestInitials: initials(r.guest_full_name),
      guestPhone: r.guest_phone || undefined,
      room: r.rooms?.number
        ? `${r.room_types?.name_es ?? "Habitación"} ${r.rooms.number}`
        : (r.room_types?.name_es ?? "Habitación"),
      partyLabel: `${party} persona${party === 1 ? "" : "s"}`,
      checkInTimeLabel,
      hoursAway: hoursUntilCheckIn(r.check_in, propertyCheckInTime),
    });
  }

  for (const r of (pendingR.data ?? []) as unknown as PendingRow[]) {
    items.push({
      kind: "payment-pending",
      id: r.id,
      guestName: r.guest_full_name,
      guestInitials: initials(r.guest_full_name),
      room: r.rooms?.number
        ? `${r.room_types?.name_es ?? "Habitación"} ${r.rooms.number}`
        : (r.room_types?.name_es ?? "Habitación"),
      stayLabel: formatStayLabel(r.check_in, r.check_out),
      totalCOP: Math.round(r.total_cents / 100),
      ageLabel: ageLabel(r.created_at),
    });
  }

  return items.slice(0, 5);
}

/**
 * Próximos 7 días de check-ins (confirmados + pending_payment).
 * Mapea al shape `CheckIn` esperado por UpcomingCheckIns.
 */
export async function getUpcomingCheckInsDashboard(
  propertyId: string,
): Promise<CheckIn[]> {
  const supabase = await createClient();
  const now = new Date();
  const today = iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
  const horizon = iso(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7)),
  );

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, check_in, check_out, guest_full_name, status, room_types(name_es), rooms(number)",
    )
    .eq("property_id", propertyId)
    .in("status", ["confirmed", "pending_payment"] satisfies BookingStatus[])
    .gte("check_in", today)
    .lte("check_in", horizon)
    .order("check_in", { ascending: true })
    .limit(8);

  if (error) throw mapDbError(error);

  type Row = {
    id: string;
    check_in: string;
    check_out: string;
    guest_full_name: string;
    status: BookingStatus;
    room_types: { name_es: string } | null;
    rooms: { number: string } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((r) => {
    const status: CheckIn["status"] =
      r.status === "confirmed" ? "confirmed" : "payment-pending";
    const statusLabel = r.status === "confirmed" ? "Confirmada" : "Pago pendiente";
    return {
      id: r.id,
      guest: r.guest_full_name,
      room: r.room_types?.name_es ?? "Habitación",
      roomNumber: r.rooms?.number ?? "—",
      arrival: {
        dayLabel: relativeDayLabel(r.check_in, today),
        isoDate: r.check_in,
      },
      departure: {
        dayLabel: shortDayLabel(r.check_out),
        isoDate: r.check_out,
      },
      status,
      statusLabel,
    };
  });
}

/* ─── helpers de formato ─── */

function iso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const MONTHS_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatStayLabel(checkInIso: string, checkOutIso: string): string {
  const [, m1, d1] = checkInIso.split("-").map(Number);
  const [, m2, d2] = checkOutIso.split("-").map(Number);
  if (m1 === m2) {
    return `${d1}–${d2} ${MONTHS_ABBR[m1 - 1]}`;
  }
  return `${d1} ${MONTHS_ABBR[m1 - 1]} – ${d2} ${MONTHS_ABBR[m2 - 1]}`;
}

function ageLabel(createdAtIso: string): string {
  const diffMs = Date.now() - new Date(createdAtIso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

const DAYS_ABBR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function relativeDayLabel(targetIso: string, todayIso: string): string {
  if (targetIso === todayIso) return "Hoy";
  const target = new Date(targetIso + "T00:00:00Z").getTime();
  const today = new Date(todayIso + "T00:00:00Z").getTime();
  const diffDays = Math.round((target - today) / 86_400_000);
  if (diffDays === 1) return "Mañana";
  return shortDayLabel(targetIso);
}

function shortDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return DAYS_ABBR[d.getUTCDay()];
}

/**
 * Normaliza `check_in_time` de DB (HH:MM:SS o HH:MM) a label HH:MM.
 * Default 15:00 si no se pasa o no es parseable.
 */
function formatCheckInTimeLabel(checkInTime?: string | null): string {
  if (!checkInTime) return "15:00";
  const match = checkInTime.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : "15:00";
}

/**
 * Calcula horas hasta el check-in asumiendo zona horaria America/Bogota
 * (UTC-5, sin DST). Cuando hagamos multi-timezone (Phase D) usar el
 * `property.timezone` real. Negativo / 0 → 0 (ya pasó la hora estimada).
 */
function hoursUntilCheckIn(
  checkInDate: string,
  checkInTime?: string | null,
): number {
  const time = formatCheckInTimeLabel(checkInTime);
  // Construye epoch ms del check-in en Bogota (UTC-5).
  const ms = Date.parse(`${checkInDate}T${time}:00-05:00`);
  if (Number.isNaN(ms)) return 0;
  const diffMs = ms - Date.now();
  if (diffMs <= 0) return 0;
  return Math.max(1, Math.round(diffMs / 3_600_000));
}
