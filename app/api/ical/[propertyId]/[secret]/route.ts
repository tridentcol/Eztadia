import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Export iCal de una propiedad — URL publica protegida por secret.
 *
 * URL: /api/ical/{propertyId}/{secret}.ics
 *
 * OTAs (Booking, Airbnb, etc.) consumen este feed para bloquear las fechas
 * confirmadas/pending en sus propios calendarios. Re-fetcheamos en cada GET
 * (sin cache) — no son tantas reservas y el feed se chequea ~1x/hora.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ propertyId: string; secret: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { propertyId, secret: rawSecret } = await params;
  // El segmento puede llegar como "abc.ics" — limpiamos extension.
  const secret = rawSecret.replace(/\.ics$/i, "");

  const admin = createAdminClient();

  // 1. Validar secret
  const { data: prop } = await admin
    .from("properties")
    .select("id, name, slug, ical_export_secret, timezone")
    .eq("id", propertyId)
    .maybeSingle();
  if (!prop || prop.ical_export_secret !== secret) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. Cargar bookings + holds activos
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, code, check_in, check_out, guest_full_name, status, room_id")
    .eq("property_id", propertyId)
    .in("status", ["confirmed", "pending_payment"]);

  const events = (bookings ?? []).map((b) =>
    veventFor({
      uid: `booking-${b.id}@eztadia`,
      summary: `Reservado · ${b.code}`,
      dtstart: b.check_in,
      dtend: b.check_out,
      description: b.guest_full_name ?? "",
    }),
  );

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Eztadia//${escapeText(prop.name)}//ES`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(prop.name)}`,
    `X-WR-TIMEZONE:${prop.timezone ?? "America/Bogota"}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(calendar, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${prop.slug}.ics"`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

function veventFor(e: {
  uid: string;
  summary: string;
  dtstart: string; // YYYY-MM-DD
  dtend: string;
  description: string;
}): string {
  // En iCal, all-day DATE values (sin time) van como DTSTART;VALUE=DATE:YYYYMMDD
  const ds = e.dtstart.replace(/-/g, "");
  const de = e.dtend.replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ds}`,
    `DTEND;VALUE=DATE:${de}`,
    `SUMMARY:${escapeText(e.summary)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ].join("\r\n");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
