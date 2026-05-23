import "server-only";
import type {
  BookingDetail,
  BookingOrigin,
  BookingRow,
  BookingStatus as DemoBookingStatus,
} from "@/lib/bookings";
import type { Database } from "@/lib/supabase/database.types";

type BookingDbRow = Database["public"]["Tables"]["bookings"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

type BookingWithJoins = BookingDbRow & {
  room_types: Pick<RoomTypeRow, "id" | "name_es" | "name_en"> | null;
  rooms: Pick<RoomRow, "id" | "number"> | null;
};

const MONTHS_SHORT_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const DOW_LONG_ES = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

function dayLabels(iso: string): { dayLabelLong: string; dayLabelShort: string } {
  const d = new Date(iso + "T00:00:00Z");
  return {
    dayLabelLong: DOW_LONG_ES[d.getUTCDay()],
    dayLabelShort: `${d.getUTCDate()} ${MONTHS_SHORT_ES[d.getUTCMonth()]}`,
  };
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function statusFromDb(s: BookingDbRow["status"]): DemoBookingStatus {
  switch (s) {
    case "confirmed":
      return "confirmed";
    case "pending_payment":
      return "pending";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "no_show":
      return "no-show";
    default:
      return "pending";
  }
}

function originFromSource(s: BookingDbRow["source"]): BookingOrigin {
  switch (s) {
    case "direct":
      return "direct";
    case "booking_com":
      return "booking";
    case "airbnb":
      return "airbnb";
    case "manual":
      return "manual";
    default:
      return "direct";
  }
}

export function buildBookingRow(b: BookingWithJoins): BookingRow {
  return {
    code: b.code,
    guest: { name: b.guest_full_name, initials: initialsFromName(b.guest_full_name) },
    roomNumber: b.rooms?.number ?? "—",
    roomType: b.room_types?.name_es ?? "—",
    checkIn: { iso: b.check_in, ...dayLabels(b.check_in) },
    checkOut: { iso: b.check_out, ...dayLabels(b.check_out) },
    totalCOP: Math.round(b.total_cents / 100),
    status: statusFromDb(b.status),
    origin: originFromSource(b.source),
  };
}

function payStateFromPayment(p: PaymentRow | null): BookingDetail["payment"]["state"] {
  if (!p) return "waiting-receipt";
  if (p.status === "approved") return "approved";
  if (p.status === "refunded") return "refunded";
  if (p.status === "declined" || p.status === "voided") return "rejected";
  return "waiting-receipt";
}

function paymentMethodLabel(b: BookingDbRow): string {
  if (b.payment_method === "pse") return "PSE vía Wompi";
  if (b.payment_method === "manual_transfer") return "Transferencia bancaria";
  if (b.payment_method === "external") return "Externo (OTA)";
  return "Manual";
}

function docTypeFromDb(s: string | null): BookingDetail["guestInfo"]["documentType"] {
  if (s === "CC") return "CC";
  if (s === "CE") return "CE";
  if (s === "passport") return "Pasaporte";
  if (s === "NIT") return "NIT";
  return "CC";
}

function countryCodeFromName(country: string | null): BookingDetail["guestInfo"]["countryCode"] {
  const c = (country ?? "").toLowerCase();
  if (c.includes("colombia")) return "CO";
  if (c.includes("estados") || c.includes("united states") || c === "usa") return "US";
  if (c.includes("reino unido") || c.includes("united kingdom") || c === "uk") return "GB";
  if (c.includes("españa") || c.includes("spain") || c === "es") return "ES";
  if (c.includes("méxico") || c.includes("mexico") || c === "mx") return "MX";
  return "CO";
}

function formatAuditAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const m = MONTHS_SHORT_ES[d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${m}, ${hh}:${mm}`;
}

const AUDIT_TITLE_ES: Record<string, string> = {
  "booking.confirmed": "Pago confirmado",
  "booking.cancelled": "Reserva cancelada",
  "booking.room_assigned": "Habitación asignada",
  "booking_hold.created": "Hold creado",
  "public_booking.hold_created": "Reserva creada (web pública)",
  "payment.received": "Pago recibido",
  "payment.refunded": "Reembolso emitido",
};

export function buildBookingDetail(args: {
  booking: BookingWithJoins;
  property: PropertyRow;
  rooms: Pick<RoomRow, "id" | "floor"> | null;
  payment: PaymentRow | null;
  auditLogs: AuditLogRow[];
}): BookingDetail {
  const base = buildBookingRow(args.booking);
  const b = args.booking;

  return {
    ...base,
    guestInfo: {
      document: b.guest_document_number ?? "—",
      documentType: docTypeFromDb(b.guest_document_type),
      email: b.guest_email,
      phone: b.guest_phone,
      country: b.guest_country ?? "Colombia",
      countryCode: countryCodeFromName(b.guest_country),
      note: b.notes ?? undefined,
    },
    stay: {
      // nights es generated col (INT); Supabase tipa como string|number — normaliza.
      nights: typeof b.nights === "number" ? b.nights : Number(b.nights ?? 0),
      adults: b.adults,
      children: b.children,
      // rooms.floor viene como string|null desde Supabase; UI espera number.
      floor: args.rooms?.floor ? Number(args.rooms.floor) || 0 : 0,
      checkInTime: args.property.check_in_time.slice(0, 5),
      checkOutTime: args.property.check_out_time.slice(0, 5),
    },
    payment: {
      method: paymentMethodLabel(b),
      state: payStateFromPayment(args.payment),
      ref: args.payment?.wompi_transaction_id ?? args.payment?.wompi_reference ?? undefined,
      paidAt: args.payment?.confirmed_at
        ? formatAuditAt(args.payment.confirmed_at)
        : undefined,
    },
    cancellation: b.cancelled_at
      ? { at: formatAuditAt(b.cancelled_at), reason: b.cancellation_reason ?? "Sin razón" }
      : undefined,
    // WhatsApp messages aún sin integrar (Phase E2)
    messages: [],
    history: args.auditLogs.map((a) => ({
      title: AUDIT_TITLE_ES[a.action] ?? a.action,
      at: formatAuditAt(a.created_at),
      meta: a.action.startsWith("public_booking") ? "web pública" : undefined,
    })),
  };
}
