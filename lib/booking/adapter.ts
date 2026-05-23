import "server-only";
import type { BookingHold } from "@/lib/booking-flow";
import type { Database } from "@/lib/supabase/database.types";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type BookingHoldRow = Database["public"]["Tables"]["booking_holds"]["Row"];

const MONTHS_SHORT_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function labelFromIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_SHORT_ES[m - 1]}`;
}

function nightsBetweenIso(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

function stripSeconds(time: string): string {
  // "15:00:00" → "15:00"
  return time.length >= 5 ? time.slice(0, 5) : time;
}

function photoFromProperty(property: PropertyRow): string {
  if (property.cover_image_url) return property.cover_image_url;
  if (Array.isArray(property.gallery) && property.gallery.length > 0) {
    const first = property.gallery[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first && "url" in first) {
      const url = (first as { url: unknown }).url;
      if (typeof url === "string") return url;
    }
  }
  // Placeholder gris neutral si la propiedad no tiene foto aun.
  return "/placeholder-property.svg";
}

function shortCodeFromId(id: string, prefix = "HOLD"): string {
  const trimmed = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `${prefix}-${trimmed}`;
}

/**
 * Construye `whatsapp` (display) + `helpUrl` (wa.me link) desde
 * properties.contact_phone. Si la columna esta vacia, devuelve strings
 * vacios y "#" — los componentes renderizan sin romperse.
 */
function contactFromProperty(property: PropertyRow): {
  whatsapp: string;
  helpUrl: string;
} {
  const raw = property.contact_phone?.trim();
  if (!raw) return { whatsapp: "", helpUrl: "#" };
  // Limpia para wa.me: solo digitos (sin +, espacios, guiones)
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 7) return { whatsapp: raw, helpUrl: "#" };
  return {
    whatsapp: raw,
    helpUrl: `https://wa.me/${digits}`,
  };
}

/**
 * Construye un BookingHold "borrador" desde query params + datos reales de DB.
 * Se usa en /p/[slug]/booking/new ANTES de crear el hold real — para mostrar
 * el SummaryCard correcto mientras el guest llena sus datos.
 *
 * `totalCents` viene calculado por el caller (base_price * nights por ahora,
 * sin seasonal rates — eso entra en C+).
 */
export function buildDraftHold(args: {
  property: PropertyRow;
  roomType: RoomTypeRow;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalCents: number;
}): BookingHold {
  const nights = nightsBetweenIso(args.checkIn, args.checkOut);
  const contact = contactFromProperty(args.property);
  return {
    id: "_draft",
    code: "PENDIENTE",
    property: {
      slug: args.property.slug,
      name: args.property.name,
      city: args.property.city ?? "",
      photo: photoFromProperty(args.property),
      whatsapp: contact.whatsapp,
      helpUrl: contact.helpUrl,
    },
    room: {
      typeName: args.roomType.name_es,
      number: "",
    },
    stay: {
      checkInIso: args.checkIn,
      checkOutIso: args.checkOut,
      checkInLabel: labelFromIsoDate(args.checkIn),
      checkOutLabel: labelFromIsoDate(args.checkOut),
      checkInTime: stripSeconds(args.property.check_in_time),
      checkOutTime: stripSeconds(args.property.check_out_time),
      nights,
      adults: args.adults,
      children: args.children,
    },
    totalCOP: Math.round(args.totalCents / 100),
    // Sin expiracion en un borrador. El hold real la setea al insertar.
    expiresAt: new Date(Date.now() + 60_000 * 15).toISOString(),
  };
}

/**
 * Construye un BookingHold desde una fila real de booking_holds + property
 * + room_type. Se usa en /pay y /status para renderizar el hold post-submit.
 */
export function buildHoldFromRow(args: {
  hold: BookingHoldRow;
  property: PropertyRow;
  roomType: RoomTypeRow;
  adults?: number;
  children?: number;
}): BookingHold {
  const nights = nightsBetweenIso(args.hold.check_in, args.hold.check_out);
  const contact = contactFromProperty(args.property);
  return {
    id: args.hold.id,
    code: shortCodeFromId(args.hold.id, "HOLD"),
    property: {
      slug: args.property.slug,
      name: args.property.name,
      city: args.property.city ?? "",
      photo: photoFromProperty(args.property),
      whatsapp: contact.whatsapp,
      helpUrl: contact.helpUrl,
    },
    room: {
      typeName: args.roomType.name_es,
      number: "—",
    },
    stay: {
      checkInIso: args.hold.check_in,
      checkOutIso: args.hold.check_out,
      checkInLabel: labelFromIsoDate(args.hold.check_in),
      checkOutLabel: labelFromIsoDate(args.hold.check_out),
      checkInTime: stripSeconds(args.property.check_in_time),
      checkOutTime: stripSeconds(args.property.check_out_time),
      nights,
      // booking_holds no guarda adults/children todavia (es parte del booking
      // final post-confirm). Caller puede pasar valores conocidos via querystring
      // si vienen del flow inicial; default 1/0 para no romper UI.
      adults: args.adults ?? 1,
      children: args.children ?? 0,
    },
    totalCOP: Math.round(args.hold.total_cents / 100),
    expiresAt: args.hold.expires_at,
  };
}
