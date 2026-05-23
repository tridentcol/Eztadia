import Image from "next/image";
import { ArrowRight } from "@/components/icons";

const TYPES = [
  {
    title: "Hotel boutique",
    copy: "De 5 a 30 habitaciones, con cuidado del detalle. Eztadia respeta tu marca y la potencia.",
    img: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=900&q=80",
    alt: "Lobby de hotel boutique con luz cálida y muebles artesanales",
  },
  {
    title: "Complejo vacacional",
    copy: "Cabañas, casas o suites independientes. Cada una con su propio tipo de habitación y tarifa estacional.",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
    alt: "Cabaña tropical con techo de palma rodeada de vegetación",
  },
  {
    title: "Edificio de habitaciones",
    copy: "Múltiples unidades en un mismo inmueble. Gestiona staff con permisos por rol.",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
    alt: "Fachada de edificio con balcones y plantas, luz dorada de la tarde",
  },
];

export function PropertyTypes() {
  return (
    <section
      aria-labelledby="types-title"
      className="bg-cream"
      style={{ paddingTop: 128, paddingBottom: 128 }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <header className="mb-16 max-w-[720px]">
          <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
            Para tu tipo de propiedad
          </span>
          <h2
            id="types-title"
            className="font-serif font-medium text-ink leading-[1.08] tracking-[-0.015em] m-0"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Una herramienta, tres formas de hospedar.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TYPES.map((t, i) => (
            <article
              key={t.title}
              className={[
                "group bg-paper border border-rule overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-organic hover:-translate-y-0.5 hover:border-sage-soft",
                i === 2 ? "md:col-span-2 lg:col-span-1 md:max-w-[540px] md:mx-auto lg:max-w-none lg:mx-0" : "",
              ].join(" ")}
              style={{ borderRadius: 20 }}
            >
              <div className="relative aspect-[4/3] bg-linen overflow-hidden">
                <Image
                  src={t.img}
                  alt={t.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-organic group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-7">
                <h4 className="font-serif italic font-medium text-ink text-[24px] leading-[1.15] tracking-[-0.01em] m-0 mb-3">
                  {t.title}
                </h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0 mb-5 max-w-[36ch]">
                  {t.copy}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage border-b border-transparent hover:border-sage transition-colors duration-200 pb-px"
                >
                  Ver cómo funciona
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
