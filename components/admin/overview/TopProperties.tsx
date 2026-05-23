import type { TopProperty, AttentionProperty } from "@/lib/admin";
import { IconArrowRight } from "../icons";

export function TopProperties({
  top,
  attention,
}: {
  top: TopProperty[];
  attention: AttentionProperty[];
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      <article className="bg-paper border border-rule rounded-[20px] p-7 sm:p-8">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Más reservadas este mes
        </span>
        <h3 className="font-serif italic font-medium text-[20px] m-0 mb-[22px] tracking-[-0.015em]">
          Top <em className="italic">5</em>.
        </h3>

        <div className="flex flex-col">
          {top.map((row, i) => (
            <a
              key={row.rank}
              className={`grid items-baseline py-4 gap-4 cursor-pointer hover:bg-cream rounded-lg -mx-2 px-2 ${
                i === 0 ? "" : "border-t border-rule"
              }`}
              style={{ gridTemplateColumns: "44px 1fr auto" }}
            >
              <span
                className="font-serif font-medium text-[28px] text-gold tracking-[-0.02em]"
                style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
              >
                {row.rank}
              </span>
              <div>
                <p className="font-serif italic font-medium text-[16px] text-ink m-0 mb-0.5 tracking-[-0.01em]">
                  {row.name}
                </p>
                <p
                  className="text-xs text-ink-muted m-0"
                  style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
                >
                  <span className="text-ink-soft font-medium">{row.bookings}</span> reservas ·{" "}
                  <span className="text-ink-soft font-medium">{row.revenueLabel}</span>
                </p>
              </div>
              <IconArrowRight className="w-[13px] h-[13px] text-ink-muted" />
            </a>
          ))}
        </div>
      </article>

      <article className="bg-paper border border-rule rounded-[20px] p-7 sm:p-8">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Necesitan atención
        </span>
        <h3 className="font-serif italic font-medium text-[20px] m-0 mb-[22px] tracking-[-0.015em]">
          A revisar.
        </h3>

        <div className="flex flex-col">
          {attention.map((row, i) => (
            <a
              key={row.name}
              className={`grid items-baseline py-4 gap-4 cursor-pointer hover:bg-cream rounded-lg -mx-2 px-2 ${
                i === 0 ? "" : "border-t border-rule"
              }`}
              style={{ gridTemplateColumns: "12px 1fr auto" }}
            >
              <span
                aria-hidden
                className="w-2 h-2 rounded-full bg-clay mt-[7px]"
              />
              <div>
                <p className="font-serif italic font-medium text-[16px] text-ink m-0 mb-0.5 tracking-[-0.01em]">
                  {row.name}
                </p>
                <p className="text-[12.5px] text-clay m-0">{row.reason}</p>
              </div>
              <IconArrowRight className="w-[13px] h-[13px] text-ink-muted" />
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
