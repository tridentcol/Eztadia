"use client";

import { useMemo, useState } from "react";
import { formatCOP } from "@/lib/format";
import type { SeasonalRateView } from "./PricingPageClient";

const DAYS_DEFAULT = 30;
const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const WEEKDAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function effectivePrice(
  rates: SeasonalRateView[],
  basePriceCents: number,
  dateISO: string,
): { priceCents: number; rateName: string | null; isOverride: boolean } {
  const applicable = rates
    .filter((r) => r.startDate <= dateISO && dateISO <= r.endDate)
    .sort((a, b) => b.priority - a.priority);
  if (applicable.length > 0 && applicable[0].priceCents !== basePriceCents) {
    return {
      priceCents: applicable[0].priceCents,
      rateName: applicable[0].name,
      isOverride: true,
    };
  }
  return { priceCents: basePriceCents, rateName: null, isOverride: false };
}

export function PricingMiniCalendar({
  basePriceCents,
  rates,
}: {
  basePriceCents: number;
  rates: SeasonalRateView[];
}) {
  const [offset, setOffset] = useState(0);

  const days = useMemo(() => {
    const arr: { date: Date; iso: string; effective: ReturnType<typeof effectivePrice> }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + offset * DAYS_DEFAULT);
    for (let i = 0; i < DAYS_DEFAULT; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = isoDay(d);
      arr.push({ date: d, iso, effective: effectivePrice(rates, basePriceCents, iso) });
    }
    return arr;
  }, [offset, basePriceCents, rates]);

  const firstLabel = `${days[0].date.getDate()} ${MONTHS_ES[days[0].date.getMonth()]}`;
  const lastLabel = `${days[days.length - 1].date.getDate()} ${MONTHS_ES[days[days.length - 1].date.getMonth()]}`;

  return (
    <div className="border-t border-rule px-5 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
          Precio efectivo · {firstLabel}–{lastLabel}
        </span>
        <div className="inline-flex gap-1.5">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="Periodo anterior"
            className="w-7 h-7 rounded-md inline-flex items-center justify-center text-ink-muted hover:bg-linen hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Periodo siguiente"
            className="w-7 h-7 rounded-md inline-flex items-center justify-center text-ink-muted hover:bg-linen hover:text-ink transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5">
        {days.map((d) => {
          const cop = Math.round(d.effective.priceCents / 100);
          const tooltipParts = [
            `${WEEKDAYS_ES[d.date.getDay()]} ${d.date.getDate()} ${MONTHS_ES[d.date.getMonth()]}`,
            `${formatCOP(cop)} / noche`,
          ];
          if (d.effective.rateName) tooltipParts.push(`Tarifa: ${d.effective.rateName}`);
          else if (d.effective.isOverride) tooltipParts.push("Tarifa estacional");
          return (
            <div
              key={d.iso}
              title={tooltipParts.join(" · ")}
              className={[
                "flex flex-col items-center rounded-lg border px-1 py-1.5 transition-colors",
                d.effective.isOverride
                  ? "border-[rgba(196,154,60,0.4)] bg-[rgba(196,154,60,0.08)]"
                  : "border-rule bg-paper",
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-[0.05em] text-ink-muted">
                {WEEKDAYS_ES[d.date.getDay()]} {d.date.getDate()}
              </span>
              <span
                className={[
                  "font-serif text-[12.5px] mt-0.5",
                  d.effective.isOverride ? "text-[#8A6E2E]" : "text-ink-soft",
                ].join(" ")}
                style={{
                  fontVariantNumeric: "oldstyle-nums tabular-nums",
                  fontFeatureSettings: '"onum","tnum"',
                }}
              >
                {cop >= 1000 ? `${Math.round(cop / 1000)}k` : cop}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] text-ink-muted m-0 mt-3 leading-[1.45]">
        Color dorado: día con tarifa estacional aplicada. Sin color: precio base.
      </p>
    </div>
  );
}
