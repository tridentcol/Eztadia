import type { RevenueSnapshot } from "@/lib/admin";

export function RevenueChart({ data }: { data: RevenueSnapshot }) {
  const max = Math.max(...data.days.map((d) => d.amountCOP));
  const totalLabel = formatMillions(data.totalCOP);

  return (
    <section
      aria-label="Ingresos del mes"
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-5 mb-14"
    >
      <article className="bg-paper border border-rule rounded-[20px] p-7 sm:p-8">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Ingresos procesados
        </span>
        <h2 className="font-serif italic font-medium text-[22px] m-0 mb-[22px] tracking-[-0.015em]">
          {data.monthLabel}.
        </h2>

        <div
          className="flex items-end justify-between gap-1 bg-linen rounded-[14px] px-4 sm:px-[18px] pt-6 pb-4 relative"
          style={{ height: 200 }}
        >
          {data.days.map((d) => {
            const heightPct = max ? Math.round((d.amountCOP / max) * 100) : 0;
            const isFuture = d.isFuture;
            return (
              <span
                key={d.day}
                title={
                  isFuture
                    ? `${d.day} may — futuro`
                    : `${d.day} may — ${formatMillions(d.amountCOP)}`
                }
                className={[
                  "flex-1 min-w-[4px] rounded-t-[3px] transition-colors duration-200 ease-organic cursor-pointer",
                  isFuture
                    ? "bg-[rgba(92,117,103,0.55)]/35 opacity-35"
                    : d.isToday
                      ? "bg-sage"
                      : "bg-[rgba(92,117,103,0.55)] hover:bg-sage",
                ].join(" ")}
                style={{
                  height: isFuture ? "35%" : `${heightPct}%`,
                  background: isFuture
                    ? "rgba(92,117,103,0.2)"
                    : d.isToday
                      ? "var(--color-sage)"
                      : "rgba(92,117,103,0.55)",
                }}
                aria-hidden
              />
            );
          })}
        </div>
      </article>

      <article className="bg-paper border border-rule rounded-[20px] p-7 sm:p-8">
        <div className="flex flex-col">
          <Row label="Ingreso total del mes" big value={`${totalLabel}`} cur="COP" />
          <Row label="Promedio por reserva" value={formatThousands(data.averagePerBookingCOP)} cur="COP" />
          <Row
            label="Mejor día"
            value={`${data.bestDay.dayLabel} · ${formatMillions(data.bestDay.amountCOP)}`}
          />
          <Row
            label="Comisión Eztadia"
            value="$0"
            badge="Plan gratis"
            last
          />
        </div>
      </article>
    </section>
  );
}

function Row({
  label,
  value,
  cur,
  big = false,
  badge,
  last = false,
}: {
  label: string;
  value: string;
  cur?: string;
  big?: boolean;
  badge?: string;
  last?: boolean;
}) {
  return (
    <div className={`py-3.5 ${last ? "" : "border-b border-rule"}`}>
      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-1">
        {label}
      </span>
      <span
        className={`font-serif font-medium text-ink tracking-[-0.015em] inline-flex items-baseline gap-2 flex-wrap ${big ? "text-[32px]" : "text-[20px]"}`}
        style={{ fontVariantNumeric: "oldstyle-nums tabular-nums", fontFeatureSettings: '"onum","tnum"' }}
      >
        {value}
        {cur && (
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted font-sans">
            {cur}
          </span>
        )}
        {badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)] font-sans font-medium text-[10px] tracking-[0.06em] uppercase">
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}

function formatMillions(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString("es-CO")}`;
}

function formatThousands(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString("es-CO")}`;
}
