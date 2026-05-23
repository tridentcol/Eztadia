"use client";

import { useState } from "react";
import {
  IconChevronDown,
} from "@/components/dashboard/icons";
import { ChevronLeft, ChevronRight } from "@/components/property/PhosphorIcons";

type View = "day" | "week" | "month";

export function CalendarToolbar({
  monthLabel,
  totalRooms,
  occupancyPercent,
  onOpenSummary,
}: {
  monthLabel: string;
  totalRooms: number;
  occupancyPercent: number;
  onOpenSummary?: () => void;
}) {
  const [view, setView] = useState<View>("month");

  return (
    <header className="flex items-end justify-between gap-6 flex-wrap mb-8">
      <div>
        <h1 className="font-serif italic font-medium text-ink m-0 tracking-[-0.02em]" style={{ fontSize: 32 }}>
          {monthLabel}
        </h1>
        <p className="text-sm text-ink-muted mt-1.5 m-0">
          Viendo <span className="oldstyle">{totalRooms}</span> habitaciones · <span className="oldstyle">{occupancyPercent}%</span> ocupado
        </p>
      </div>

      <div className="inline-flex items-center gap-3 flex-wrap">
        {/* View switcher */}
        <div role="group" aria-label="Tipo de vista" className="inline-flex bg-linen border border-rule rounded-full p-[3px] gap-0.5">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={[
                "px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors",
                view === v
                  ? "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-rule),0_1px_2px_rgba(31,27,22,0.04)]"
                  : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>

        {/* Prev / Today / Next */}
        <button
          type="button"
          aria-label="Mes anterior"
          className="w-[34px] h-[34px] rounded-[10px] text-ink-soft hover:text-ink hover:bg-linen border border-transparent hover:border-rule inline-flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium text-ink-soft hover:text-ink hover:bg-linen border border-transparent hover:border-rule transition-colors"
        >
          Hoy
        </button>
        <button
          type="button"
          aria-label="Mes siguiente"
          className="w-[34px] h-[34px] rounded-[10px] text-ink-soft hover:text-ink hover:bg-linen border border-transparent hover:border-rule inline-flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span aria-hidden className="w-px h-6 bg-rule mx-1" />

        {/* Filters */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 bg-cream border border-rule rounded-full text-[13px] font-medium text-ink-soft hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          Todas las habitaciones
          <IconChevronDown className="w-3 h-3 text-ink-muted" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 bg-cream border border-rule rounded-full text-[13px] font-medium text-ink-soft hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          Estado
          <IconChevronDown className="w-3 h-3 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={onOpenSummary}
          className="h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium text-ink-soft hover:text-ink hover:bg-linen border border-transparent hover:border-rule transition-colors"
        >
          Resumen del mes
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[34px] px-4 bg-transparent border border-sage text-sage rounded-[10px] text-[13px] font-medium hover:bg-sage-tint transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className="w-3.5 h-3.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Reserva manual
        </button>
      </div>
    </header>
  );
}
