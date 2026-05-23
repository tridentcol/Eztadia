"use client";

import { useEffect } from "react";
import { Close } from "@/components/icons";
import { getOccupancyByDay, type CalendarMonth } from "@/lib/calendar";

export function MonthSummaryPanel({
  month,
  open,
  onClose,
}: {
  month: CalendarMonth;
  open: boolean;
  onClose: () => void;
}) {
  const occupancy = getOccupancyByDay(month);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-[55] bg-[rgba(31,27,22,0.2)]"
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Resumen del mes"
        aria-hidden={!open}
        className={`fixed top-0 right-0 bottom-0 w-[320px] bg-paper border-l border-rule p-7 z-[60] overflow-y-auto transition-transform duration-300 ease-organic ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: open ? "var(--shadow-pop)" : "none" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif italic font-medium text-ink m-0" style={{ fontSize: 20 }}>
            Mayo en cifras
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="w-8 h-8 rounded-lg text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
          >
            <Close width={16} height={16} />
          </button>
        </div>

        <Stat label="Ocupación promedio" value={`${month.occupancyPercent}%`} />
        <Stat label="Reservas confirmadas" value="22" />
        <Stat label="Ingresos confirmados" value="$18.4M" footnote="COP · solo pagos confirmados" />
        <Stat label="ADR (tarifa promedio)" value="$298k" />

        <div className="mt-6">
          <p className="text-[11px] tracking-[0.08em] uppercase text-ink-muted font-medium m-0 mb-2">
            Ocupación día a día
          </p>
          <div className="flex items-end gap-[3px] h-[60px] pb-1 border-b border-rule" aria-hidden>
            {occupancy.map((pct, i) => (
              <span
                key={i}
                className={`flex-1 rounded-t-[2px] min-h-[2px] ${
                  i + 1 === month.today ? "bg-gold" : "bg-sage"
                }`}
                style={{ height: Math.max(2, pct * 0.6) }}
                title={`Día ${i + 1}: ${pct}%`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] tracking-[0.08em] uppercase text-gold font-medium m-0 mb-2.5">
            Mejores 3 días
          </p>
          <TopRow day="Sábado 23 may" pct="100%" />
          <TopRow day="Viernes 29 may" pct="92%" />
          <TopRow day="Sábado 30 may" pct="92%" />
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value, footnote }: { label: string; value: string; footnote?: string }) {
  return (
    <div className="py-4 border-b border-rule last:border-b-0">
      <p className="text-xs text-ink-muted m-0 mb-1.5">{label}</p>
      <p
        className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.01em] m-0"
        style={{ fontSize: 32 }}
      >
        {value}
      </p>
      {footnote && (
        <p className="text-[11px] text-ink-muted tracking-[0.04em] mt-1.5 m-0">{footnote}</p>
      )}
    </div>
  );
}

function TopRow({ day, pct }: { day: string; pct: string }) {
  const [dayName, dayDate] = day.split(/ (?=\d)/);
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-rule last:border-b-0 text-[13px]">
      <span className="font-serif italic text-ink">
        {dayName} <span className="oldstyle">{dayDate}</span>
      </span>
      <span className="text-sage font-medium oldstyle">{pct}</span>
    </div>
  );
}
