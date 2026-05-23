import { HeroCurve } from "../icons";

export function BillingTab() {
  return (
    <div className="max-w-[640px] mx-auto bg-paper border border-rule rounded-[24px] py-14 px-10 text-center mt-8">
      <HeroCurve className="w-[100px] h-8 mx-auto mb-6 text-gold opacity-75" />
      <h1 className="font-serif italic font-medium text-[clamp(28px,4vw,32px)] text-ink m-0 mb-3.5 tracking-[-0.025em] leading-[1.1]">
        Estás en el plan <em className="italic">gratis</em>.
      </h1>
      <p className="text-base text-ink-soft m-0 mx-auto mb-7 max-w-[44ch] leading-[1.55]">
        Y así seguirá hasta que tengas más de <span className="oldstyle">30</span> habitaciones. Cuando llegue el momento, te avisaremos con tiempo.
      </p>
      <button
        type="button"
        className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint transition-colors"
      >
        Conocer el plan Pro (próximamente)
      </button>
    </div>
  );
}
