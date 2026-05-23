import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type MessageRow = Database["public"]["Tables"]["whatsapp_messages"]["Row"];

export type ConversationSummary = {
  /** Phone del huésped — clave del agrupamiento. */
  counterpartPhone: string;
  /** Nombre del huésped si pudimos resolverlo vía booking, sino null. */
  guestName: string | null;
  /** Código de la última booking asociada, si hay. */
  bookingCode: string | null;
  bookingId: string | null;
  /** Preview del último mensaje (body truncado). */
  lastBody: string | null;
  /** Tipo del último mensaje. */
  lastDirection: MessageRow["direction"];
  lastStatus: MessageRow["status"];
  lastAt: string;
  /** Total de mensajes con esta contraparte. */
  totalCount: number;
  /** Mensajes entrantes en últimas 48h (proxy de "sin leer" — no hay flag real). */
  recentInbound: number;
};

/**
 * Agrupa mensajes en conversaciones por contraparte (el teléfono del
 * huésped). Para cada conversación devuelve metadata para el list view
 * de /dashboard/messages.
 *
 * Trade-off: traemos los últimos 500 mensajes y agrupamos TS-side. Para
 * el volumen esperado en una propiedad boutique (decenas a cientos por
 * mes) es suficiente. Si crece se reescribe con un view o RPC.
 */
export async function listConversations(
  propertyId: string,
  opts: { limit?: number } = {},
): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select(
      "id, direction, status, from_phone, to_phone, body, booking_id, created_at",
    )
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 500);

  if (error) throw mapDbError(error);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  // Agrupa por counterpart phone (huésped, no nosotros).
  const buckets = new Map<
    string,
    {
      lastRow: typeof rows[number];
      total: number;
      recentInbound: number;
      bookingId: string | null;
    }
  >();

  const since48h = Date.now() - 48 * 60 * 60 * 1000;

  for (const r of rows) {
    const counterpart =
      r.direction === "outbound" ? r.to_phone : r.from_phone;
    const isRecentInbound =
      r.direction === "inbound" && new Date(r.created_at).getTime() >= since48h;

    const cur = buckets.get(counterpart);
    if (!cur) {
      buckets.set(counterpart, {
        lastRow: r, // primero que vemos = el más reciente (orden desc)
        total: 1,
        recentInbound: isRecentInbound ? 1 : 0,
        bookingId: r.booking_id,
      });
    } else {
      cur.total += 1;
      if (isRecentInbound) cur.recentInbound += 1;
      // Si no había booking aún pero esta tiene, adóptala (queremos linkear).
      if (!cur.bookingId && r.booking_id) cur.bookingId = r.booking_id;
    }
  }

  // Resolver guest_name + booking_code via batch lookup.
  const bookingIds = Array.from(
    new Set(
      Array.from(buckets.values())
        .map((b) => b.bookingId)
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const bookings = bookingIds.length > 0
    ? await supabase
        .from("bookings")
        .select("id, code, guest_full_name, guest_phone")
        .in("id", bookingIds)
    : { data: [] as { id: string; code: string; guest_full_name: string; guest_phone: string }[], error: null };

  if (bookings.error) throw mapDbError(bookings.error);

  const bookingMap = new Map(
    (bookings.data ?? []).map((b) => [b.id, b]),
  );

  // Sort conversaciones por lastAt desc (orden de iteracion del map puede no preservarse).
  const summaries: ConversationSummary[] = Array.from(buckets.entries()).map(
    ([phone, bucket]) => {
      const booking = bucket.bookingId ? bookingMap.get(bucket.bookingId) : null;
      return {
        counterpartPhone: phone,
        guestName: booking?.guest_full_name ?? null,
        bookingCode: booking?.code ?? null,
        bookingId: bucket.bookingId,
        lastBody: bucket.lastRow.body,
        lastDirection: bucket.lastRow.direction,
        lastStatus: bucket.lastRow.status,
        lastAt: bucket.lastRow.created_at,
        totalCount: bucket.total,
        recentInbound: bucket.recentInbound,
      };
    },
  );

  return summaries.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export type ConversationMessage = Pick<
  MessageRow,
  "id" | "direction" | "status" | "from_phone" | "to_phone" |
  "body" | "template_name" | "error" | "booking_id" | "created_at"
>;

/**
 * Devuelve TODOS los mensajes entre la propiedad y una contraparte
 * (en orden cronológico ascendente para renderizar conversación).
 */
export async function getConversationMessages(
  propertyId: string,
  counterpartPhone: string,
): Promise<ConversationMessage[]> {
  const supabase = await createClient();

  // El counterpart aparece como to_phone (outbound) O from_phone (inbound).
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select(
      "id, direction, status, from_phone, to_phone, body, template_name, error, booking_id, created_at",
    )
    .eq("property_id", propertyId)
    .or(`to_phone.eq.${counterpartPhone},from_phone.eq.${counterpartPhone}`)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) throw mapDbError(error);
  return data ?? [];
}
