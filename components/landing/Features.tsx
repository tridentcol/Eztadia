const FEATURES = [
  {
    num: "01",
    title: "Tu propiedad, tu marca",
    copy: "Cada propiedad tiene su propia página pública. Sin marketplace, sin distracciones. El huésped llega por tu link y reserva contigo.",
    span: "col-span-12 lg:col-span-7",
    offset: "",
    numSize: "text-[72px] lg:text-[96px]",
  },
  {
    num: "02",
    title: "Pagos que tus huéspedes ya entienden",
    copy: "PSE colombiano vía Wompi, o transferencia bancaria con comprobante. Sin pasarelas internacionales caras ni comisiones por reserva.",
    span: "col-span-12 lg:col-start-8 lg:col-span-5",
    offset: "lg:pt-20",
    numSize: "text-[72px] lg:text-[80px]",
  },
  {
    num: "03",
    title: "WhatsApp como canal nativo",
    copy: "Confirmaciones automáticas, recordatorios pre-check-in y respuestas desde tu dashboard. Sin números no oficiales que se banean.",
    span: "col-span-12 lg:col-span-5",
    offset: "lg:pt-10 lg:self-end",
    numSize: "text-[72px] lg:text-[80px]",
  },
  {
    num: "04",
    title: "Tu calendario, sincronizado",
    copy: "Booking, Airbnb y tu Eztadia hablan entre sí cada 15 minutos. Cero overbookings. Cero hojas de cálculo.",
    span: "col-span-12 lg:col-start-6 lg:col-span-7",
    offset: "",
    numSize: "text-[72px] lg:text-[96px]",
  },
];

export function Features() {
  return (
    <section
      id="producto"
      aria-labelledby="why-title"
      className="bg-cream"
      style={{ paddingTop: "clamp(72px, 12vw, 160px)", paddingBottom: "clamp(72px, 12vw, 160px)" }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <header className="mb-16 max-w-[720px]">
          <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
            Por qué Eztadia
          </span>
          <h2
            id="why-title"
            className="font-serif font-medium text-ink leading-[1.08] tracking-[-0.015em] m-0"
            style={{ fontSize: "clamp(32px, 4.4vw, 52px)" }}
          >
            Hecho por personas que han <em className="italic">gestionado</em> habitaciones.
          </h2>
        </header>

        <div className="grid grid-cols-12 gap-x-8 gap-y-14 lg:gap-y-24">
          {FEATURES.map((f) => (
            <article key={f.num} className={`${f.span} ${f.offset} grid grid-cols-[auto_1fr] gap-7 items-start`}>
              <span
                aria-hidden
                className={`font-serif italic font-medium text-gold leading-none oldstyle tracking-tight ${f.numSize}`}
              >
                {f.num}
              </span>
              <div>
                <h3 className="font-serif font-medium text-ink m-0 mb-3 leading-[1.18] tracking-[-0.01em] max-w-[22ch]" style={{ fontSize: "clamp(22px, 2.2vw, 28px)" }}>
                  {f.title}
                </h3>
                <p className="text-ink-soft text-base leading-[1.6] m-0 max-w-[44ch]">
                  {f.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
