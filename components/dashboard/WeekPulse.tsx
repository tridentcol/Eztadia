import { IconArrowRight } from "./icons";
import { formatCOP } from "@/lib/format";
import type { WeekMetric } from "@/lib/dashboard";

export function WeekPulse({ metrics }: { metrics: WeekMetric[] }) {
  return (
    <aside aria-label="Métricas de la semana">
      <header className="mb-5">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-2">
          Esta semana
        </span>
        <h3 className="font-serif italic font-medium text-ink m-0 tracking-[-0.015em]" style={{ fontSize: 22 }}>
          El pulso.
        </h3>
      </header>

      <div>
        {metrics.map((m, i) => (
          <MetricRow key={i} metric={m} first={i === 0} last={i === metrics.length - 1} />
        ))}
      </div>

      <div className="mt-6">
        <a
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 text-[13px] text-sage border-b border-transparent hover:border-sage transition-colors pb-px"
        >
          Ver reporte completo
          <IconArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
}

function MetricRow({ metric, first, last }: { metric: WeekMetric; first: boolean; last: boolean }) {
  const padTop = first ? "pt-1" : "pt-[22px]";
  const border = last ? "" : "border-b border-rule";
  return (
    <div className={`${border} ${padTop} pb-[22px]`}>
      <p className="text-[13px] text-ink-muted m-0 mb-2">{metric.label}</p>
      {renderValue(metric)}
    </div>
  );
}

function renderValue(m: WeekMetric) {
  if (m.kind === "occupancy") {
    return (
      <>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em]" style={{ fontSize: 44 }}>
            {m.value}%
          </span>
          <SagePill>{m.changeLabel}</SagePill>
        </div>
        <div className="mt-3 h-1 bg-linen rounded-full overflow-hidden" aria-hidden>
          <span
            className="block h-full bg-sage rounded-full transition-[width] duration-700 ease-organic"
            style={{ width: `${m.value}%` }}
          />
        </div>
      </>
    );
  }
  if (m.kind === "bookings") {
    return (
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em]" style={{ fontSize: 44 }}>
          {m.value}
        </span>
        <LinenPill>{m.breakdown}</LinenPill>
      </div>
    );
  }
  if (m.kind === "revenue") {
    return (
      <>
        <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em] block" style={{ fontSize: 44 }}>
          {formatCOP(m.valueCOP)}
        </span>
        <span className="block text-[11px] text-ink-muted mt-2 tracking-[0.04em]">{m.footnote}</span>
      </>
    );
  }
  // response-time
  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em]" style={{ fontSize: 44 }}>
        {m.valueLabel}
      </span>
      <SagePill>{m.qualityLabel}</SagePill>
    </div>
  );
}

function SagePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] bg-sage-tint text-sage border border-[rgba(92,117,103,0.18)]">
      {children}
    </span>
  );
}
function LinenPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] bg-linen text-ink-soft border border-rule">
      {children}
    </span>
  );
}
