import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseBlocks, type ParsedBlock } from "./parser";

/**
 * Sync de iCal entrante. Una pasada por feed:
 *   1. fetch URL (timeout 20s)
 *   2. parsear VEVENT activos (no CANCELLED) con start/end válidos
 *   3. borrar external_blocks de este feed cuyo external_uid ya NO está en el feed
 *   4. upsert resto por (ical_feed_id, external_uid)
 *   5. actualizar last_synced_at o last_sync_error
 *
 * Idempotente. Si la URL falla, deja last_synced_at intacto y graba el error
 * en last_sync_error para que el UI lo muestre.
 *
 * Constraint dura: external_blocks.room_id es NOT NULL. Si feed.room_id es
 * null, no podemos importar — marcamos error y devolvemos 0 imported.
 */

const FETCH_TIMEOUT_MS = 20_000;
const MAX_ICS_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_SYNC_INTERVAL_MS = 60_000; // No re-syncar el mismo feed dos veces en <60s

export type SyncOutcome = {
  feedId: string;
  ok: boolean;
  imported: number;
  removed: number;
  error: string | null;
};

export async function syncIcalFeed(feedId: string): Promise<SyncOutcome> {
  const admin = createAdminClient();

  const { data: feed, error: feedErr } = await admin
    .from("ical_feeds")
    .select("id, property_id, room_id, url, direction, is_active, last_synced_at")
    .eq("id", feedId)
    .maybeSingle();

  if (feedErr || !feed) {
    return failOutcome(feedId, feedErr?.message ?? "Feed no encontrado.");
  }

  if (feed.direction !== "inbound") {
    return failOutcome(feedId, "Solo se sincronizan feeds entrantes.");
  }

  if (!feed.is_active) {
    return failOutcome(feedId, "Feed inactivo.");
  }

  if (!feed.room_id) {
    const msg =
      "Feed entrante requiere habitación asignada para importar bloqueos.";
    await markFeedError(feedId, msg);
    return { feedId, ok: false, imported: 0, removed: 0, error: msg };
  }

  try {
    const text = await fetchIcal(feed.url);
    const blocks = parseBlocks(text);

    const uids = blocks.map((b) => b.uid);

    // 3. borrar UIDs ausentes (full-sync). No usamos .neq IN array por límite
    //    del query string — usamos NOT IN si hay pocos UIDs, sino split.
    let removed = 0;
    if (uids.length === 0) {
      const { count, error } = await admin
        .from("external_blocks")
        .delete({ count: "exact" })
        .eq("ical_feed_id", feedId);
      if (error) throw error;
      removed = count ?? 0;
    } else {
      const { count, error } = await admin
        .from("external_blocks")
        .delete({ count: "exact" })
        .eq("ical_feed_id", feedId)
        .not("external_uid", "in", `(${uids.map(quoteCsv).join(",")})`);
      if (error) throw error;
      removed = count ?? 0;
    }

    // 4. upsert resto
    let imported = 0;
    if (blocks.length > 0) {
      const rows = blocks.map((b) => ({
        ical_feed_id: feedId,
        property_id: feed.property_id,
        room_id: feed.room_id as string,
        external_uid: b.uid,
        start_date: b.start,
        end_date: b.end,
        summary: b.summary,
      }));

      const { error } = await admin
        .from("external_blocks")
        .upsert(rows, { onConflict: "ical_feed_id,external_uid" });
      if (error) throw error;
      imported = rows.length;
    }

    await admin
      .from("ical_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq("id", feedId);

    return { feedId, ok: true, imported, removed, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido al sincronizar.";
    await markFeedError(feedId, msg);
    return { feedId, ok: false, imported: 0, removed: 0, error: msg };
  }
}

/**
 * Itera todos los feeds inbound activos y syncea en paralelo limitado.
 * Salta los que se hayan sincronizado en los últimos MIN_SYNC_INTERVAL_MS
 * para evitar tormentas si el cron se dispara dos veces cerca.
 */
export async function syncAllActiveInbound(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  outcomes: SyncOutcome[];
}> {
  const admin = createAdminClient();

  const cutoff = new Date(Date.now() - MIN_SYNC_INTERVAL_MS).toISOString();
  const { data: feeds, error } = await admin
    .from("ical_feeds")
    .select("id, last_synced_at")
    .eq("direction", "inbound")
    .eq("is_active", true);

  if (error) throw new Error(`No se pudieron leer feeds: ${error.message}`);

  const all = feeds ?? [];
  const toSync = all.filter(
    (f) => !f.last_synced_at || f.last_synced_at < cutoff,
  );
  const skipped = all.length - toSync.length;

  // Concurrencia controlada — 4 a la vez es conservador para evitar
  // saturar el host externo (mismo dominio en varios feeds, p.ej. Booking.com).
  const outcomes: SyncOutcome[] = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < toSync.length; i += CONCURRENCY) {
    const batch = toSync.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((f) => syncIcalFeed(f.id)));
    outcomes.push(...results);
  }

  const succeeded = outcomes.filter((o) => o.ok).length;
  const failed = outcomes.length - succeeded;

  return { total: all.length, succeeded, failed, skipped, outcomes };
}

/* ─── helpers ─── */

async function fetchIcal(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Eztadia-iCal/1.0 (+https://eztadia.com)" },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al descargar feed.`);
    }
    const cl = Number(res.headers.get("content-length") ?? "0");
    if (cl && cl > MAX_ICS_BYTES) {
      throw new Error(`Feed demasiado grande (${cl} bytes).`);
    }
    const text = await res.text();
    if (text.length > MAX_ICS_BYTES) {
      throw new Error(`Feed demasiado grande (${text.length} bytes).`);
    }
    if (!text.includes("BEGIN:VCALENDAR")) {
      throw new Error("Respuesta no parece un iCalendar.");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// parseBlocks + toDateOnly + vEventToBlock + addOneDay + parameterValueToString
// viven ahora en lib/ical/parser.ts — para permitir unit tests sin server-only.

function quoteCsv(uid: string): string {
  // PostgREST .not("in", "(a,b,c)") espera CSV con valores entre comillas si
  // contienen caracteres especiales. Quoteamos siempre con doble comilla y
  // escapamos comillas internas.
  return `"${uid.replace(/"/g, '""')}"`;
}

async function markFeedError(feedId: string, message: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("ical_feeds")
    .update({ last_sync_error: message.slice(0, 500) })
    .eq("id", feedId);
}

function failOutcome(feedId: string, error: string): SyncOutcome {
  return { feedId, ok: false, imported: 0, removed: 0, error };
}
