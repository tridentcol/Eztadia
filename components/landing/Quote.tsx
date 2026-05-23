import Image from "next/image";

export function Quote() {
  return (
    <section aria-labelledby="quote-label" className="bg-linen py-24">
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <figure className="relative max-w-[720px] mx-auto px-4">
          <span
            aria-hidden
            className="absolute -top-10 -left-2 font-serif italic font-semibold text-gold/25 leading-none pointer-events-none select-none"
            style={{ fontSize: 180 }}
          >
            “
          </span>

          <blockquote
            id="quote-label"
            className="relative font-serif italic font-medium text-ink leading-[1.4] tracking-[-0.015em] m-0 mb-8"
            style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
          >
            Dejamos de pelearnos con tres planillas y un Excel. Ahora todo respira en un solo lugar.
          </blockquote>

          <figcaption className="inline-flex items-center gap-3.5">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80"
              alt=""
              width={44}
              height={44}
              className="rounded-full object-cover border border-rule"
            />
            <div>
              <div className="text-sm font-medium text-ink">María Fernanda — Casa Marina, Cartagena</div>
              <div className="text-[12px] text-ink-muted mt-0.5">Hotel boutique · 8 habitaciones</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
