import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeroOrnament, UnderlineCurve } from "@/components/icons";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero-fade pt-12 pb-20 lg:pt-22 lg:pb-32"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <div className="grid items-start gap-12 lg:gap-24 lg:grid-cols-[6fr_4fr]">
          {/* TEXT — col izquierda */}
          <div className="lg:pt-6">
            <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-7">
              Para hoteles boutique
            </span>

            <h1
              id="hero-title"
              className="font-serif font-medium text-ink m-0 leading-[1.02] tracking-[-0.025em]"
              style={{ fontSize: "clamp(44px, 7.4vw, 88px)" }}
            >
              La forma <em className="italic">serena</em>
              <br />
              de gestionar{" "}
              <span className="relative inline-block whitespace-nowrap">
                habitaciones.
                <UnderlineCurve
                  className="absolute left-[-2%] right-[-2%] bottom-[-18px] w-[104%] h-[18px] text-gold opacity-80"
                />
              </span>
            </h1>

            <p className="mt-7 text-[17px] lg:text-[18px] leading-[1.6] text-ink-soft max-w-[56ch]">
              Páginas públicas hermosas para cada propiedad, reservas con PSE o
              transferencia, WhatsApp nativo y calendario sincronizado con Booking
              y Airbnb. Sin pasarelas caras. Sin suscripciones por habitación.
            </p>

            <div className="mt-9 inline-flex items-center gap-2.5 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-13 px-7 rounded-[14px] text-[15px] font-medium text-cream bg-terracotta hover:bg-clay active:scale-[0.98] transition-[background-color,transform] duration-200"
                style={{ height: 52 }}
              >
                Comenzar gratis
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 h-13 px-[18px] rounded-[14px] text-sm font-medium text-ink hover:bg-linen transition-colors duration-200 group"
                style={{ height: 52 }}
              >
                Ver demo en vivo
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>

            <p className="mt-5 text-[13px] text-ink-muted inline-flex items-center gap-2.5">
              <span aria-hidden className="w-4 h-px bg-rule-strong" />
              Sin tarjeta de crédito · 5 minutos para configurar
            </p>
          </div>

          {/* MEDIA — col derecha, offset abajo en desktop */}
          <div className="relative lg:mt-[60px]">
            <HeroOrnament
              className="absolute -top-10 -right-7 w-[140px] h-[140px] lg:w-[180px] lg:h-[180px] text-gold opacity-85 pointer-events-none"
            />

            <div
              className="relative overflow-hidden bg-linen"
              style={{ aspectRatio: "3 / 4", borderRadius: 28 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
                alt="Habitación de hotel boutique con linos blancos y luz dorada de la tarde, ventanas con vegetación tropical detrás."
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            {/* Polaroid note */}
            <aside
              aria-label="Métrica de la semana"
              className="absolute -bottom-5 left-auto right-[-12px] lg:right-auto lg:left-[-28px] w-[280px] bg-paper border border-rule p-4 pr-5"
              style={{
                borderRadius: 14,
                transform: "rotate(-2.4deg)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <span className="block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-1.5">
                Esta semana
              </span>
              <p className="font-serif italic font-medium text-[18px] leading-[1.15] text-ink m-0 mb-2 oldstyle">
                12 reservas <em className="italic">confirmadas</em>
              </p>
              <p className="text-[12px] text-ink-muted m-0">
                Casa Marina · Cartagena · Mayo 2026
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
