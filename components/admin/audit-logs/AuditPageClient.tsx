"use client";

import { useMemo, useState } from "react";
import type { AdminAuditLogRow } from "@/lib/db/queries/admin";
import type { Database } from "@/lib/supabase/database.types";
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

export function AuditPageClient({
  rows,
  resourceTypes,
}: {
  rows: AdminAuditLogRow[];
  resourceTypes: string[];
}) {
  const [query, setQuery] = useState("");
  const [actorFilter, setActorFilter] = useState<ActorType | "all">("all");
  const [resourceFilter, setResourceFilter] = useState<string | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      <AuditDetailDrawer
        log={log}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
