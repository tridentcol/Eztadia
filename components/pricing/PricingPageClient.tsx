"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import { SeasonalRateFormDrawer } from "./SeasonalRateFormDrawer";
import { PricingMiniCalendar } from "./PricingMiniCalendar";
import {
  IconArrow,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconTag,
} from "./icons";

export type SeasonalRateView = {
  id: string;
  name: string | null;
  startDate: string;
  endDate: string;
  priceCents: number;
  priority: number;
};

export type RoomTypePricingView = {
  id: string;
  nameEs: string;
  basePriceCents: number;
  isActive: boolean;
  rates: SeasonalRateView[];
};

type DrawerState =
  | { mode: "create"; roomType: RoomTypePricingView }
  | { mode: "edit"; roomType: RoomTypePricingView; rate: SeasonalRateView }
  | null;

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(iso: string): string {
  // iso = YYYY-MM-DD. No usar Date constructor (sufre TZ shift).
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_ES[m - 1]} ${String(y).slice(-2)}`;
}

function nightsBetween(startIso: string, endIso: string): number {
  const a = Date.UTC(...(startIso.split("-").map(Number) as [number, number, number]));
  const b = Date.UTC(...(endIso.split("-").map(Number) as [number, number, number]));
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function PricingPageClient({
  roomTypes,
}: {
  roomTypes: RoomTypePricingView[];
}) {
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const totalRates = useMemo(
    () => roomTypes.reduce((acc, rt) => acc + rt.rates.length, 0),
    [roomTypes],
  );
  const activeTypes = roomTypes.filter((rt) => rt.isActive).length;

  if (roomTypes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="pb-12">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
            Propiedad
          </span>
          <h1 className="font-serif italic font-medium text-[32px] sm:text-[36px] text-ink m-0 tracking-[-0.02em] leading-[1.05]">
            Precios
          </h1>
          <p className="text-sm text-ink-soft m-0 mt-2 max-w-[56ch] leading-[1.55]">
            El precio base de cada tipo aplica por defecto. Crea tarifas
            estacionales para sobrescribirlo en rangos específicos (temporada
            alta, festivos, eventos).
          </p>
        </div>
      </header>

      {/* Summary */}
      <div className="mb-7 flex items-center gap-6 px-5 py-3.5 border border-rule rounded-[14px] bg-paper">
        <Stat label="Tipos activos" value={activeTypes} />
        <span aria-hidden className="h-6 w-px bg-rule" />
        <Stat label="Tarifas estacionales" value={totalRates} />
      </div>

      <div className="flex flex-col gap-5">
        {roomTypes.map((rt) => (
          <RoomTypeRow
            key={rt.id}
            rt={rt}
            onCreate={() => setDrawer({ mode: "create", roomType: rt })}
            onEdit={(rate) =>
              setDrawer({ mode: "edit", roomType: rt, rate })
            }
          />
        ))}
      </div>

      <SeasonalRateFormDrawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        roomTypeId={drawer?.roomType.id ?? ""}
        roomTypeName={drawer?.roomType.nameEs ?? ""}
        basePriceCents={drawer?.roomType.basePriceCents ?? 0}
        initial={
          drawer?.mode === "edit"
            ? {
                id: drawer.rate.id,
                name: drawer.rate.name,
                startDate: drawer.rate.startDate,
                endDate: drawer.rate.endDate,
                priceCents: drawer.rate.priceCents,
                priority: drawer.rate.priority,
              }
            : undefined
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      <span
        className="font-serif text-[22px] text-ink leading-none mt-1"
        style={{
          fontVariantNumeric: "oldstyle-nums tabular-nums",
          fontFeatureSettings: '"onum","tnum"',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RoomTypeRow({
  rt,
  onCreate,
  onEdit,
}: {
  rt: RoomTypePricingView;
  onCreate: () => void;
  onEdit: (rate: SeasonalRateView) => void;
}) {
  const basePriceCop = Math.round(rt.basePriceCents / 100);
  const sortedRates = useMemo(
    () =>
      [...rt.rates].sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.startDate.localeCompare(b.startDate);
      }),
    [rt.rates],
  );

  return (
    <article
      className={[
        "border rounded-[18px] bg-paper transition-colors",
        rt.isActive ? "border-rule" : "border-rule bg-cream",
      ].join(" ")}
    >
      <header className="px-5 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 tracking-[-0.01em]">
              {rt.nameEs}
            </h2>
            {!rt.isActive && (
              <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium bg-linen text-ink-muted">
                Archivado
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-ink-muted m-0">
            Precio base:{" "}
            <span
              className="font-serif text-ink-soft"
              style={{
                fontVariantNumeric: "oldstyle-nums tabular-nums",
                fontFeatureSettings: '"onum","tnum"',
              }}
            >
              {formatCOP(basePriceCop)}
            </span>{" "}
            / noche
          </p>
        </div>
        {rt.isActive && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-rule text-[13px] font-medium text-ink-soft hover:border-rule-strong hover:text-ink transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Tarifa estacional
          </button>
        )}
      </header>

      <PricingMiniCalendar
        basePriceCents={rt.basePriceCents}
        rates={rt.rates}
      />

      <div className="border-t border-rule px-5 sm:px-6 py-4">
        {sortedRates.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted m-0 py-1.5">
            Sin tarifas estacionales. Se cobra siempre el precio base.
          </p>
        ) : (
          <ul className="flex flex-col">
            {sortedRates.map((rate, idx) => (
              <li
                key={rate.id}
                className={[
                  "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3",
                  idx === 0 ? "" : "border-t border-rule",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5 min-w-0 sm:min-w-[200px]">
                  <span className="w-7 h-7 rounded-md inline-flex items-center justify-center bg-sage-tint text-sage shrink-0">
                    <IconTag className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13.5px] font-medium text-ink truncate">
                    {rate.name ?? "Sin nombre"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft min-w-0 sm:flex-1">
                  <IconCalendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span className="tabular-nums">{formatDate(rate.startDate)}</span>
                  <IconArrow className="w-3 h-3 text-ink-muted shrink-0" />
                  <span className="tabular-nums">{formatDate(rate.endDate)}</span>
                  <span className="text-ink-muted ml-1">
                    · {nightsBetween(rate.startDate, rate.endDate)} noches
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <span
                    className="font-serif text-[18px] text-ink"
                    style={{
                      fontVariantNumeric: "oldstyle-nums tabular-nums",
                      fontFeatureSettings: '"onum","tnum"',
                    }}
                  >
                    {formatCOP(Math.round(rate.priceCents / 100))}
                  </span>
                  {rate.priority > 0 && (
                    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium bg-cream text-ink-muted border border-rule">
                      P{rate.priority}
                    </span>
                  )}
                  {rt.isActive && (
                    <button
                      type="button"
                      onClick={() => onEdit(rate)}
                      aria-label={`Editar ${rate.name ?? "tarifa"}`}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-ink-muted hover:bg-linen hover:text-ink transition-colors"
                    >
                      <IconEdit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="pb-12">
      <header className="mb-8">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
          Propiedad
        </span>
        <h1 className="font-serif italic font-medium text-[32px] sm:text-[36px] text-ink m-0 tracking-[-0.02em] leading-[1.05]">
          Precios
        </h1>
      </header>
      <div className="border border-dashed border-rule-strong rounded-[20px] bg-paper px-6 py-12 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-sage-tint inline-flex items-center justify-center text-sage">
          <IconTag className="w-5 h-5" />
        </div>
        <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-2 tracking-[-0.01em]">
          Primero crea un tipo de habitación
        </h2>
        <p className="text-sm text-ink-soft m-0 max-w-[44ch] mx-auto leading-[1.55]">
          Las tarifas se aplican sobre un tipo. Crea al menos uno y vuelve aquí
          para configurar precios estacionales.
        </p>
        <Link
          href="/dashboard/rooms"
          className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-sage text-cream text-[13.5px] font-medium hover:bg-sage-dark transition-colors"
        >
          Ir a habitaciones
        </Link>
      </div>
    </div>
  );
}
