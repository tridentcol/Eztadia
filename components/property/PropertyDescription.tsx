import type { Property } from "@/lib/properties";

export function PropertyDescription({ property }: { property: Property }) {
  if (!property.description) return null;

  return (
    <section className="mb-20" aria-labelledby="desc-title">
      <span id="desc-title" className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Sobre {property.name}
      </span>
      <p className="text-[17px] leading-[1.7] text-ink m-0 max-w-[68ch]">
        {property.description}
      </p>
    </section>
  );
}
