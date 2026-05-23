"use client";

import { useMemo } from "react";
import { useBooking } from "./BookingProvider";
import { DateRangePicker } from "./DateRangePicker";
import { Plus, Minus } from "./PhosphorIcons";
import { formatCOP } from "@/lib/format";

export function BookingWidget({ embedded = false }: { embedded?: boolean }) {
  const { property, checkIn, checkOut, nights, adults, childrenCount, setRange, setAdults, setChildren } = useBooking();

  const minPrice = useMemo(
    () => Math.min(...property.rooms.map((r) => r.basePriceCOP)),
    [property.rooms],
  );

  // Demo: use the cheapest room price for the summary.
  const summaryRate = minPrice;
  const summaryTotal = nights * summaryRate;
  const blocked = useMemo(() => new Set(property.blockedDates), [property.blockedDates]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={[
        "bg-paper",
        embedded ? "p-5 border-0 rounded-none shadow-none" : "border border-rule p-7",
      ].join(" ")}
      style={embedded ? undefined : { borderRadius: 20, boxShadow: "var(--shadow-soft)" }}
    >
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-3">
        Reserva tu estancia
      </span>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.01em]" style={{ fontSize: 32 }}>
          COP {formatCOP(minPrice)}
        </span>
        <span className="text-[13px] text-ink-muted">desde / noche</span>
      </div>

      <div className="h-px bg-rule mb-4" />

      <DateRangePicker
        start={checkIn}
        end={checkOut}
        blockedDates={blocked}
        onChange={(s, e) => setRange(s, e)}
      />

      <div className="mt-4">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-ink-muted mb-2">
          Huéspedes
        </span>
        <GuestRow
          label="Adultos"
          sub="A partir de 13 años"
          value={adults}
          min={1}
          onChange={setAdults}
        />
        <GuestRow
          label="Niños"
          sub="Hasta 12 años"
          value={childrenCount}
          min={0}
          onChange={setChildren}
        />
      </div>

      {nights > 0 && (
        <div className="border-t border-rule pt-3.5 mt-4 mb-4">
          <div className="flex justify-between text-sm text-ink-soft mb-1.5">
            <span>
              <span className="oldstyle">{nights}</span> noches × COP <span className="oldstyle">{formatCOP(summaryRate)}</span>
            </span>
            <span className="oldstyle">{formatCOP(summaryTotal)}</span>
          </div>
          <div className="flex justify-between items-baseline mt-2.5">
            <span className="text-[13px] text-ink-muted uppercase tracking-[0.08em]">Total</span>
            <span className="font-serif font-medium text-ink oldstyle" style={{ fontSize: 22 }}>
              COP {formatCOP(summaryTotal)}
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full h-12 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.98] transition-[background-color,transform] duration-200 mt-1"
      >
        Buscar disponibilidad
      </button>
      <p className="text-center text-[12px] text-ink-muted mt-3">
        Sin cargos por reservar · Confirmación inmediata
      </p>
    </form>
  );
}

function GuestRow({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-rule last:border-b-0">
      <span className="text-sm font-medium text-ink">
        {label}
        <span className="block text-[12px] text-ink-muted font-normal mt-0.5">{sub}</span>
      </span>
      <div className="inline-flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Menos ${label.toLowerCase()}`}
          className="w-[30px] h-[30px] rounded-full border border-rule-strong bg-paper text-ink inline-flex items-center justify-center hover:bg-linen hover:border-ink-muted disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-medium tnum text-center" style={{ minWidth: 16 }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(8, value + 1))}
          aria-label={`Más ${label.toLowerCase()}`}
          className="w-[30px] h-[30px] rounded-full border border-rule-strong bg-paper text-ink inline-flex items-center justify-center hover:bg-linen hover:border-ink-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
