import Image from "next/image";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import type { BookingHold } from "@/lib/booking-flow";
import { Countdown } from "./Countdown";
import { PSEButton } from "./PSEButton";
import { IconWhatsApp } from "@/components/dashboard/icons";

export function PaySectionPSE({ hold }: { hold: BookingHold }) {
  return (
    <article className="bg-paper border border-rule rounded-[28px] p-7 sm:p-12">
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono text-xs text-ink-muted tracking-[-0.02em]">{hold.code}</span>
        <Countdown expiresAt={hold.expiresAt} />
      </div>

      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
        Confirma tu reserva
      </span>
      <h1 className="font-serif italic font-medium text-[clamp(28px,4vw,32px)] text-ink m-0 mb-0 tracking-[-0.025em] leading-[1.1]">
        Un paso más.
      </h1>

      <div className="flex items-center gap-3.5 bg-linen rounded-[14px] px-[18px] py-3.5 mt-6">
        <span className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0">
          <Image src={hold.property.photo} alt="" width={96} height={96} className="w-full h-full object-cover" />
        </span>
        <div className="min-w-0">
          <p className="font-serif italic font-medium text-base text-ink m-0 mb-0.5 tracking-[-0.01em]">
            {hold.room.typeName}
          </p>
          <p className="text-[13px] text-ink-soft m-0 oldstyle">
            {hold.property.name} · {hold.stay.checkInLabel}-{hold.stay.checkOutLabel} · {hold.stay.nights} noches · {hold.stay.adults} huéspedes
          </p>
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-7">
        <span className="text-sm text-ink-soft">Total a pagar</span>
        <span>
          <span
            className="font-serif font-medium text-[36px] text-ink leading-none tracking-[-0.02em]"
            style={{
              fontVariantNumeric: "tabular-nums oldstyle-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {formatCOP(hold.totalCOP)}
          </span>
          <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-ink-muted ml-1.5">COP</span>
        </span>
      </div>

      <PSEButton holdId={hold.id} slug={hold.property.slug} />

      <p className="mt-[18px] text-center text-[13px] text-ink-muted max-w-[44ch] mx-auto leading-[1.55]">
        Serás redirigido a <strong className="text-ink-soft font-medium">Wompi</strong>, el sistema de pago seguro autorizado en Colombia. Tu reserva se confirma automáticamente al completar el pago.
      </p>

      <div className="mt-9 pt-6 border-t border-rule flex justify-between items-center gap-4 flex-wrap">
        <Link
          href={`/p/${hold.property.slug}/booking/new`}
          className="text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
        >
          ← Cambiar método de pago
        </Link>
        <a
          href={hold.property.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
        >
          <IconWhatsApp className="w-3 h-3" />
          ¿Necesitas ayuda? Escríbenos
        </a>
      </div>
    </article>
  );
}
