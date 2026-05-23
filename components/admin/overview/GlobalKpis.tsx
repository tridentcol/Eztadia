import type { GlobalKpi } from "@/lib/admin";

export function GlobalKpis({ kpis }: { kpis: GlobalKpi[] }) {
  return (
    <section
      aria-label="Cifras globales"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14"
    >
      {kpis.map((k) => (
        <article
          key={k.key}
          className="bg-paper border border-rule rounded-[20px] p-7 sm:p-8"
        >
          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
            {k.overline}
          </span>
          <span
            className="block font-serif font-medium text-[56px] leading-none text-ink mb-3.5 tracking-[-0.025em]"
            style={{ fontVariantNumeric: "oldstyle-nums tabular-nums", fontFeatureSettings: '"onum","tnum"' }}
          >
            {k.value.toLocaleString("es-CO")}
          </span>
          <span
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border mb-[18px]",
              k.trend.tone === "sage"
                ? "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]"
                : "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
            ].join(" ")}
          >
            {k.trend.label}
          </span>
          <div aria-hidden className="h-px bg-rule mb-3.5" />
          <p className="text-xs text-ink-muted leading-[1.5] m-0">{k.breakdown}</p>
        </article>
      ))}
    </section>
  );
}
