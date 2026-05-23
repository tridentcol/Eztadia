"use client";

import { useMemo, useState, useTransition } from "react";
import type { AdminAuditLogRow } from "@/lib/db/queries/admin";
import type { Database } from "@/lib/supabase/database.types";
import {
  loadMoreAuditLogsAction,
  exportAuditLogsAction,
} from "@/app/actions/admin";
import { downloadCsv } from "@/lib/csv";
import { IconSearch } from "../icons";
import { AuditTimeline } from "./AuditTimeline";
import { AuditDetailDrawer } from "./AuditDetailDrawer";

type ActorType = Database["public"]["Enums"]["AuditActorType"];

const ACTOR_FILTERS: { value: ActorType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "user", label: "User" },
  { value: "system", label: "Sistema" },
  { value: "webhook", label: "Webhook" },
];

const PAGE_SIZE = 200;

export function AuditPageClient({
  rows: initialRows,
  resourceTypes,
}: {
  rows: AdminAuditLogRow[];
  resourceTypes: string[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [actorFilter, setActorFilter] = useState<ActorType | "all">("all");
  const [resourceFilter, setResourceFilter] = useState<string | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialRows.length >= PAGE_SIZE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [loadingMore, startLoadMore] = useTransition();
  const [exporting, startExport] = useTransition();

  async function handleLoadMore() {
    const cursor = rows[rows.length - 1]?.createdAt;
    if (!cursor) return;
    setLoadError(null);
    startLoadMore(async () => {
      const result = await loadMoreAuditLogsAction({ cursor, limit: PAGE_SIZE });
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      const next = result.data.rows;
      if (next.length === 0) {
        setHasMore(false);
        return;
      }
      setRows((prev) => [...prev, ...next]);
      if (next.length < PAGE_SIZE) setHasMore(false);
    });
  }

  async function handleExport() {
    setExportError(null);
    startExport(async () => {
      const result = await exportAuditLogsAction();
      if (!result.ok) {
        setExportError(result.error);
        return;
      }
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`audit-logs-${date}.csv`, result.data.csv);
      if (result.data.truncated) {
        setExportError(`Export truncado a ${result.data.count} filas (hard cap).`);
      }
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (actorFilter !== "all" && r.actorType !== actorFilter) return false;
      if (resourceFilter !== "all" && r.resourceType !== resourceFilter) return false;
      if (!q) return true;
      return (
        r.action.toLowerCase().includes(q) ||
        r.resourceType.toLowerCase().includes(q) ||
        (r.actor?.email.toLowerCase().includes(q) ?? false) ||
        (r.actor?.fullName?.toLowerCase().includes(q) ?? false) ||
        (r.property?.name.toLowerCase().includes(q) ?? false) ||
        (r.resourceId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, actorFilter, resourceFilter]);

  const log = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId],
  );

  return (
    <>
      <div className="flex items-start gap-3 flex-wrap py-3.5 border-b border-rule mb-1">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por acción, actor, propiedad, ID..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />

        <div
          role="group"
          aria-label="Filtrar por tipo de actor"
          className="inline-flex items-center gap-1 flex-wrap"
        >
          {ACTOR_FILTERS.map((f) => {
            const active = actorFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setActorFilter(f.value)}
                className={[
                  "h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors border",
                  active
                    ? "bg-sage-tint text-sage border-sage-tint"
                    : "bg-cream text-ink-soft border-rule hover:bg-linen hover:text-ink hover:border-rule-strong",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />

        <div className="relative">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            aria-label="Filtrar por recurso"
            className="h-8 pl-3 pr-8 rounded-full text-[12.5px] font-medium bg-cream text-ink-soft border border-rule appearance-none cursor-pointer hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
          >
            <option value="all">Todos los recursos</option>
            {resourceTypes.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <AuditTimeline
        rows={filtered}
        selectedId={selectedId}
        onRowClick={(id) => setSelectedId(id)}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-ink-muted">
          Mostrando <span className="oldstyle">{filtered.length}</span> de{" "}
          <span className="oldstyle">{rows.length}</span> cargadas
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || rows.length === 0}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium text-sage border border-sage bg-transparent hover:bg-sage-tint disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4v12" />
              <path d="m7 11 5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium text-ink-soft border border-rule bg-cream hover:bg-linen hover:text-ink hover:border-rule-strong disabled:opacity-50 transition-colors"
            >
              {loadingMore ? "Cargando…" : "Cargar 200 más"}
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <p role="alert" className="text-[13px] text-danger mt-3 mb-0">
          {loadError}
        </p>
      )}
      {exportError && (
        <p role="alert" className="text-[13px] text-warning mt-3 mb-0">
          {exportError}
        </p>
      )}

      <AuditDetailDrawer
        log={log}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
