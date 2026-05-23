import type { Property } from "@/lib/properties";

export function PropertyDescription({ property }: { property: Property }) {
  return (
    <section className="mb-20" aria-labelledby="desc-title">
      <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Sobre {property.name}
      </span>
      <h2
        id="desc-title"
        className="font-serif font-medium text-ink m-0 mb-5 max-w-[30ch] tracking-[-0.015em]"
        style={{ fontSize: "clamp(26px, 3vw, 32px)", lineHeight: 1.15 }}
      >
        Una casa colonial <em className="italic">restaurada</em> en el corazón del centro.
      </h2>
      <p className="text-[17px] leading-[1.7] text-ink m-0 max-w-[68ch]">
        {property.description}
      </p>
    </section>
  );
}
