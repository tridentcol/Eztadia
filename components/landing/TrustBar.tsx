export function TrustBar() {
  return (
    <section aria-label="Diferenciadores" className="border-y border-rule py-14 text-center">
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <p className="font-serif italic text-[15px] lg:text-[16px] text-ink-soft inline-flex flex-wrap items-center justify-center gap-3.5 max-w-[800px]">
          <span>Construido en Colombia</span>
          <span aria-hidden className="text-gold opacity-80 text-sm">·</span>
          <span>Pagos vía PSE y transferencia</span>
          <span aria-hidden className="text-gold opacity-80 text-sm">·</span>
          <span>WhatsApp oficial de Meta</span>
        </p>
      </div>
    </section>
  );
}
