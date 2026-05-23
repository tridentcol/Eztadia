import type { CalendarComponent, VEvent } from "node-ical";

/**
 * Parser puro de iCalendar → bloques de fechas. Sin side effects.
 * Extraído de sync.ts para permitir unit tests sin DB/Storage.
 *
 * IMPORTANTE: `node-ical` se importa dinamicamente dentro de parseBlocks.
 * Top-level import ejecuta __dirname al cargar el modulo, lo cual rompe
 * el boot de los lambdas en Vercel runtime (ESM, sin __dirname). Lazy
 * import asegura que solo se carga cuando alguien parsea un feed.
 */

export type ParsedBlock = {
  uid: string;
  start: string; // YYYY-MM-DD (inclusive)
  end: string;   // YYYY-MM-DD (exclusive, estilo iCal)
  summary: string | null;
};

/**
 * Convierte una cadena iCal en bloques uniformes. Filtra:
 * - Componentes que no son VEVENT
 * - Eventos con STATUS=CANCELLED
 * - Eventos sin UID o sin start válido
 * - Eventos con end <= start
 *
 * Dedupe por UID — si el feed repite, gana el último (RFC 5545
 * permite reemplazos parciales, pero para bloqueos basta con el más
 * reciente del cuerpo).
 */
export async function parseBlocks(text: string): Promise<ParsedBlock[]> {
  const ical = await import("node-ical");
  const parsed = ical.sync.parseICS(text);
  const out: ParsedBlock[] = [];
  const seen = new Set<string>();

  for (const key of Object.keys(parsed)) {
    const ev = parsed[key] as CalendarComponent | undefined;
    if (!ev || ev.type !== "VEVENT") continue;
    const block = vEventToBlock(ev);
    if (!block) continue;
    if (seen.has(block.uid)) {
      const idx = out.findIndex((b) => b.uid === block.uid);
      if (idx >= 0) out[idx] = block;
    } else {
      out.push(block);
      seen.add(block.uid);
    }
  }
  return out;
}

export function vEventToBlock(ev: VEvent): ParsedBlock | null {
  if (ev.status === "CANCELLED") return null;
  if (!ev.uid || !ev.start) return null;

  const startStr = toDateOnly(ev.start);
  if (!startStr) return null;
  const endStr = ev.end ? toDateOnly(ev.end) : addOneDay(startStr);
  if (!endStr) return null;
  if (endStr <= startStr) return null;

  return {
    uid: ev.uid,
    start: startStr,
    end: endStr,
    summary: parameterValueToString(ev.summary),
  };
}

export function toDateOnly(d: Date | string): string | null {
  const date = typeof d === "string" ? new Date(d) : d;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addOneDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return toDateOnly(next)!;
}

export function parameterValueToString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "val" in (v as Record<string, unknown>)) {
    const val = (v as Record<string, unknown>).val;
    return typeof val === "string" ? val : null;
  }
  return null;
}
