import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export function Closing() {
  return (
    <section
      id="demo"
      aria-labelledby="closing-title"
      className="relative overflow-hidden bg-linen"
      style={{ height: "80vh", minHeight: 560 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=80')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(31,27,22,0) 50%, rgba(31,27,22,0.18) 100%)",
        }}
      />

      <div
        className="absolute bg-cream border border-rule p-8 sm:p-12 max-w-[480px] bottom-6 left-5 right-5 sm:bottom-20 sm:left-20 sm:right-auto"
        style={{ borderRadius: 28 }}
      >
        <h2
          id="closing-title"
          className="font-serif font-medium text-ink m-0 mb-4 leading-[1.1] tracking-[-0.02em]"
          style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}
        >
          Tu primer <em className="italic">huésped</em> está más cerca de lo que crees.
        </h2>
        <p className="text-base text-ink-soft m-0 mb-7 leading-[1.55]">
          Crea tu cuenta y configura tu primera propiedad en 10 minutos. Sin tarjeta, sin compromiso.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 px-7 rounded-[14px] text-[15px] font-medium text-cream bg-terracotta hover:bg-clay active:scale-[0.98] transition-[background-color,transform] duration-200 mb-3.5"
          style={{ height: 52 }}
        >
          Comenzar gratis
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <br />
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[13px] text-sage border-b border-transparent hover:border-sage transition-colors duration-200 pb-px"
        >
          ¿Tienes una propiedad? Conoce el demo
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
}
