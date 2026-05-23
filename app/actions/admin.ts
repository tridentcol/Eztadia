"use server";

import { z } from "zod";
import { listAdminAuditLogs } from "@/lib/db/queries/admin";
import { toCsv, type CsvColumn } from "@/lib/csv";
import type { AdminAuditLogRow } from "@/lib/db/queries/admin";
import { run } from "./_helpers";

const isoOrUndef = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T/, "Cursor inválido.")
  .optional();

const loadMoreSchema = z.object({
  cursor: isoOrUndef,
  limit: z.number().int().min(1).max(500).optional(),
});

/**
 * Paginación cursor-based para `/admin/audit-logs`. El cliente pasa el
 * `created_at` de la última fila visible — devolvemos las más antiguas que
 * eso. `requireSuperAdmin` aplica dentro de `listAdminAuditLogs`.
 */
export async function loadMoreAuditLogsAction(raw: unknown) {
  return run(loadMoreSchema, raw, async ({ cursor, limit }) => {
    const rows = await listAdminAuditLogs({ cursor, limit: limit ?? 200 });
    return { rows };
  });
}

const EXPORT_HARD_CAP = 10_000;

const AUDIT_CSV_COLUMNS: CsvColumn<AdminAuditLogRow>[] = [
  { header: "Fecha (UTC)", get: (r) => r.createdAt },
  { header: "Acción", get: (r) => r.action },
  { header: "Tipo actor", get: (r) => r.actorType },
  { header: "Actor email", get: (r) => r.actor?.email ?? "" },
  { header: "Actor nombre", get: (r) => r.actor?.fullName ?? "" },
  { header: "Recurso", get: (r) => r.resourceType },
  { header: "Recurso ID", get: (r) => r.resourceId ?? "" },
  { header: "Propiedad", get: (r) => r.property?.name ?? "" },
  { header: "Propiedad slug", get: (r) => r.property?.slug ?? "" },
  { header: "IP", get: (r) => r.ip ?? "" },
  { header: "User-Agent", get: (r) => r.userAgent ?? "" },
  { header: "Diff (JSON)", get: (r) => (r.diff ? JSON.stringify(r.diff) : "") },
];

const exportSchema = z.object({}).optional();

/**
 * Descarga audit_logs cross-tenant como CSV. Cap a 10k filas (hard) para
 * evitar OOM en exports masivos — owner real necesita más, lo movemos a
 * route handler con streaming.
 */
export async function exportAuditLogsAction(_raw?: unknown) {
  return run(exportSchema, _raw, async () => {
    const rows = await listAdminAuditLogs({ limit: EXPORT_HARD_CAP });
    const csv = toCsv(rows, AUDIT_CSV_COLUMNS);
    return {
      csv,
      count: rows.length,
      truncated: rows.length === EXPORT_HARD_CAP,
    };
  });
}
