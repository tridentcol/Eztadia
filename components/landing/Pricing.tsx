import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";

const FREE = [
  "Hasta 30 habitaciones",
  "Página pública por propiedad",
  "Pagos PSE y transferencia",
  "WhatsApp Cloud API (1.000 mensajes/mes)",
  "Sincronización iCal con Booking + Airbnb",
  "Hasta 5 miembros de staff",
  "Soporte por email",
];

const PRO = [
  "Habitaciones ilimitadas",
  "Branding personalizado (dominio propio)",
  "WhatsApp ilimitado",
  "Reportes avanzados",
  "Multi-propiedad sin límite",
  "Soporte prioritario",
];

export function Pricing() {
  return (
    <section
      id="precios"
      aria-labelledby="pricing-title"
      className="bg-cream"
      style={{ paddingTop: 128, paddingBottom: 128 }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <header className="mb-16 text-center mx-auto max-w-[720px]">
          <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
            Precios
          </span>
          <h2
            id="pricing-title"
            className="font-serif font-medium text-ink leading-[1.08] tracking-[-0.015em] m-0"
            style={{ fontSize: "clamp(28px, 3.6vw, 40px)" }}
          >
            Empieza gratis. Para siempre, mientras te quepas en el plan.
          </h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[920px] mx-auto">
          {/* GRATIS */}
          <article
            className="bg-paper border border-rule p-10 flex flex-col"
            style={{ borderRadius: 28 }}
          >
            <span className="text-[12px] font-medium tracking-[0.14em] uppercase text-ink-muted mb-6">
              Gratis
            </span>
            <div className="flex items-baseline gap-2.5 mb-2">
              <span className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em]" style={{ fontSize: 64 }}>
                $0
              </span>
              <span className="text-sm text-ink-muted">/ siempre</span>
            </div>
            <p className="text-sm text-ink-soft m-0 mb-7">Para arrancar tu primera propiedad.</p>

            <ul className="list-none m-0 p-0 flex flex-col gap-3 flex-1 mb-8">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink leading-[1.5]">
                  <Check className="shrink-0 w-[18px] h-[18px] text-sage mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-7 rounded-[14px] text-[15px] font-medium text-cream bg-sage hover:bg-[#4F6759] active:scale-[0.98] transition-[background-color,transform] duration-200"
              style={{ height: 52 }}
            >
              Crear cuenta gratis
            </Link>
          </article>

          {/* PRO */}
          <article
            className="relative bg-paper border border-rule p-10 flex flex-col opacity-90"
            style={{ borderRadius: 28 }}
          >
            <span className="absolute top-7 right-7 inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-[0.14em] uppercase text-gold bg-gold/15 border border-gold/25">
              Próximamente
            </span>
            <span className="text-[12px] font-medium tracking-[0.14em] uppercase text-ink-muted mb-6">
              Pro
            </span>
            <div className="flex items-baseline gap-2.5 mb-2">
              <span className="font-serif italic font-medium text-ink leading-none tracking-[-0.02em]" style={{ fontSize: 64 }}>
                Pronto
              </span>
            </div>
            <p className="text-sm text-ink-soft m-0 mb-7">Para operaciones que crecen.</p>

            <ul className="list-none m-0 p-0 flex flex-col gap-3 flex-1 mb-8">
              {PRO.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink leading-[1.5]">
                  <Check className="shrink-0 w-[18px] h-[18px] text-sage mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 w-full px-7 rounded-[14px] text-[15px] font-medium text-ink border border-rule-strong hover:bg-linen transition-colors duration-200"
              style={{ height: 52 }}
            >
              Avísame cuando esté listo
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
