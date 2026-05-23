/**
 * Genera CSV RFC 4180 desde una lista de rows + definiciones de columnas.
 *
 * Reglas:
 *  - Comillas, comas, newlines en el valor → quote con `"` y duplicar `"` interno
 *  - Newline: `\r\n` (RFC) — Excel y LibreOffice lo respetan
 *  - BOM UTF-8 al inicio (`﻿`) para que Excel detecte UTF-8 sin "Importar texto"
 *
 * Uso:
 *   const csv = toCsv(bookings, [
 *     { header: "Código", get: (b) => b.code },
 *     { header: "Total",  get: (b) => b.total_cents / 100 },
 *   ]);
 */
export type CsvColumn<T> = {
  header: string;
  get: (row: T) => string | number | boolean | null | undefined;
};

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines: string[] = [];
  lines.push(columns.map((c) => escapeCell(c.header)).join(","));
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCell(c.get(row))).join(","));
  }
  return "﻿" + lines.join("\r\n");
}

/**
 * Dispara descarga del CSV en el browser. Client-side only.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
