import Image from "next/image";
import { Star } from "@/components/property/PhosphorIcons";
import type { Property } from "@/lib/properties";

const HERO_FALLBACK_SRC =
  "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?auto=format&fit=crop&w=2200&q=80";

export function PropertyHero({ property }: { property: Property }) {
  const hero = property.photos[0];
  const heroSrc = hero?.src ?? HERO_FALLBACK_SRC;
  const heroAlt = hero?.alt ?? `Fachada de ${property.name}`;
  const showRating = property.rating > 0;
  const showNeighborhood =
    property.neighborhood.length > 0 &&
    property.neighborhood.toLowerCase() !== property.city.toLowerCase();

  return (
    <section aria-labelledby="hero-name" className="px-4 pt-6 lg:px-8 lg:pt-6 relative">
      <div
        className="relative overflow-hidden bg-linen"
        style={{ height: "65vh", minHeight: 520, maxHeight: 720, borderRadius: 40 }}
      >
        <Image
          src={heroSrc}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(31,27,22,0) 55%, rgba(31,27,22,0.22) 100%)",
          }}
        />
      </div>

      <div className="relative -mt-20 sm:-mt-20 mx-auto max-w-[1120px] px-5 lg:px-8 flex z-10">
        <article
          className="bg-cream border border-rule p-6 sm:p-10 max-w-[520px]"
          style={{ borderRadius: 28, boxShadow: "var(--shadow-soft)" }}
        >
          <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-3.5">
            {property.type} · {property.city}
          </span>
          <h1
            id="hero-name"
            className="font-serif italic font-medium text-ink m-0 mb-4 tracking-[-0.025em]"
            style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.04 }}
          >
            {property.name}
          </h1>
          <p className="inline-flex flex-wrap items-center gap-2.5 text-sm text-ink-soft">
            {showRating && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-gold" />
                  <span>
                    {property.rating}{" "}
                    <span className="oldstyle">({property.reviewCount} reseñas)</span>
                  </span>
                </span>
                <span aria-hidden className="text-rule-strong">·</span>
              </>
            )}
            <span>{property.totalRooms} habitaciones</span>
            {showNeighborhood && (
              <>
                <span aria-hidden className="text-rule-strong">·</span>
                <span>{property.neighborhood}</span>
              </>
            )}
          </p>
        </article>
      </div>
    </section>
  );
}
