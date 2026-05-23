import type { Property } from "@/lib/properties";
import { AMENITY_META } from "./PhosphorIcons";

export function PropertyAmenities({ property }: { property: Property }) {
  return (
    <section className="mb-20" aria-labelledby="amen-title">
      <span id="amen-title" className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Qué incluye
      </span>
      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3.5 mt-2 list-none p-0 m-0"
      >
        {property.amenities.map((key) => {
          const meta = AMENITY_META[key];
          const Icon = meta.Icon;
          return (
            <li key={key} className="inline-flex items-center gap-3 text-sm font-medium text-ink">
              <Icon className="w-5 h-5 text-ink-soft shrink-0" />
              {meta.label}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
