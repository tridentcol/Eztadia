import { COMING_SOON } from "@/lib/integrations";

export function ComingSoonSection() {
  return (
    <section className="mt-16 pt-12 border-t border-rule">
      <header className="mb-6">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Próximamente
        </span>
        <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 tracking-[-0.015em]">
          Más integraciones en camino.
        </h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMING_SOON.map((it) => (
          <article
            key={it.key}
            className="bg-paper border border-rule rounded-[20px] p-6 opacity-65 hover:opacity-85 transition-opacity"
          >
            <span className="inline-block px-2.5 py-[3px] rounded-full bg-[rgba(184,146,62,0.14)] text-gold-dark text-[10px] font-medium tracking-[0.1em] uppercase mb-3">
              Próximamente
            </span>
            <h3 className="font-serif italic font-medium text-[18px] text-ink m-0 mb-1.5 tracking-[-0.01em]">
              {it.title}
            </h3>
            <p className="text-[12.5px] text-ink-soft m-0 mb-3.5 leading-[1.45]">
              {it.description}
            </p>
            <a className="text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage cursor-pointer">
              Avísame cuando esté listo →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
