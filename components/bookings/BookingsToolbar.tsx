"use client";

import { IconSearch, IconChevronDown } from "@/components/dashboard/icons";
import { Close } from "@/components/icons";

export type FilterKey = "date" | "status" | "room" | "origin";

const CHIP_LABEL: Record<FilterKey, string> = {
  date: "Todas las fechas",
  status: "Cualquier estado",
  room: "Cualquier habitación",
  origin: "Cualquier origen",
};

export function BookingsToolbar({
  query,
  onQueryChange,
  activeFilters,
  onClearFilter,
  onClearAll,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  activeFilters: Partial<Record<FilterKey, string>>;
  onClearFilter: (k: FilterKey) => void;
  onClearAll: () => void;
}) {
  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="flex items-center gap-3 flex-wrap py-[14px] mb-[14px] border-b border-rule">
      <div className="relative w-full sm:w-[320px] shrink-0">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por nombre, código, email..."
          aria-label="Buscar"
          className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
        />
      </div>

      <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />

      <div className="flex items-center gap-3 flex-wrap">
        {(Object.keys(CHIP_LABEL) as FilterKey[]).map((k) => {
          const active = activeFilters[k];
          return active ? (
            <button
              key={k}
              type="button"
              onClick={() => onClearFilter(k)}
              aria-label={`Quitar filtro ${k}`}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium bg-sage-tint text-sage border border-[rgba(92,117,103,0.2)] transition-colors hover:bg-[rgba(92,117,103,0.18)]"
            >
              {active}
              <Close className="w-3 h-3 opacity-75" />
            </button>
          ) : (
            <button
              key={k}
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium bg-cream text-ink-soft border border-rule hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
            >
              {CHIP_LABEL[k]}
              <IconChevronDown className="w-3 h-3 text-ink-muted" />
            </button>
          );
        })}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-[13px] text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
