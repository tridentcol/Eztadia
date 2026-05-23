"use client";

import { useMemo, useState } from "react";
import type {
  AdminPropertyRow,
  AdminPropertyDetail,
} from "@/lib/db/queries/admin";
import { IconSearch } from "../icons";
import { PropertiesTable } from "./PropertiesTable";
import { PropertiesCards } from "./PropertiesCards";
import { PropertyDetailDrawer } from "./PropertyDetailDrawer";

export function PropertiesPageClient({
  rows,
  details,
}: {
  rows: AdminPropertyRow[];
  details: Record<string, AdminPropertyDetail>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "active" && !r.isActive) return false;
      if (statusFilter === "inactive" && r.isActive) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        (r.city?.toLowerCase().includes(q) ?? false) ||
        (r.organization?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, statusFilter]);

  const detail = selectedId ? details[selectedId] ?? null : null;

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap py-3.5 border-b border-rule mb-3.5">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, slug, ciudad u organización..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        <div role="group" aria-label="Filtrar por estado" className="inline-flex items-center gap-1">
          {(["all", "active", "inactive"] as const).map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={[
                  "h-8 px-3 rounded-full text-[13px] font-medium transition-colors border",
                  active
                    ? "bg-sage-tint text-sage border-sage-tint"
                    : "bg-cream text-ink-soft border-rule hover:bg-linen hover:text-ink hover:border-rule-strong",
                ].join(" ")}
              >
                {s === "all" ? "Todas" : s === "active" ? "Activas" : "Inactivas"}
              </button>
            );
          })}
        </div>
      </div>

      <PropertiesTable
        rows={filtered}
        selectedId={selectedId}
        onRowClick={(id) => setSelectedId(id)}
      />
      <PropertiesCards rows={filtered} onCardClick={(id) => setSelectedId(id)} />

      <PropertyDetailDrawer
        detail={detail}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
