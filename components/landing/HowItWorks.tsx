const STEPS = [
  {
    num: "01",
    title: (
      <>
        Crea <em className="italic">tu</em> propiedad
      </>
    ),
    copy: "Sube fotos, define habitaciones y tarifas. En menos de 10 minutos tienes tu página pública lista.",
  },
  {
    num: "02",
    title: (
      <>
        Comparte el <em className="italic">link</em>
      </>
    ),
    copy: "WhatsApp, Instagram, tu propio sitio web. El huésped reserva sin cuenta, paga con PSE o transferencia.",
  },
  {
    num: "03",
    title: (
      <>
        Recibe <em className="italic">huéspedes</em>
      </>
    ),
    copy: "Confirmación automática por email y WhatsApp. Calendario actualizado en vivo. Tú te enfocas en hospedar.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como"
      aria-labelledby="how-title"
      className="bg-linen"
      style={{ paddingTop: 128, paddingBottom: 128 }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <header className="mb-16 text-center mx-auto max-w-[720px]">
          <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
            Cómo funciona
          </span>
          <h2
            id="how-title"
            className="font-serif font-medium text-ink leading-[1.08] tracking-[-0.015em] m-0"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Tres pasos y estás recibiendo huéspedes.
          </h2>
        </header>

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hairline connectors with gold dot — desktop only */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[60px] left-[calc(33.333%_-_12px)] w-6 h-px bg-rule-strong"
          >
            <span className="absolute -top-[2.5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold" />
          </div>
          <div
            aria-hidden
            className="hidden lg:block absolute top-[60px] left-[calc(66.666%_-_12px)] w-6 h-px bg-rule-strong"
          >
            <span className="absolute -top-[2.5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold" />
          </div>

          {STEPS.map((s) => (
            <article
              key={s.num}
              className="bg-paper border border-rule p-8 transition-[transform,box-shadow,border-color] duration-300 ease-organic hover:-translate-y-0.5 hover:border-rule-strong"
              style={{ borderRadius: 20 }}
            >
              <p className="font-serif italic font-medium text-sage text-[56px] leading-none oldstyle m-0 mb-6">
                {s.num}
              </p>
              <h3 className="font-serif font-medium text-ink text-[22px] leading-[1.18] tracking-[-0.01em] m-0 mb-3">
                {s.title}
              </h3>
              <p className="text-ink-soft text-[15px] leading-[1.6] m-0">{s.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
