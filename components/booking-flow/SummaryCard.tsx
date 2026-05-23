import Image from "next/image";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import type { BookingHold } from "@/lib/booking-flow";

export function SummaryCard({ hold, compact = false }: { hold: BookingHold; compact?: boolean }) {
  return (
    <div className="flex items-center gap-4 bg-paper border border-rule rounded-2xl px-4 sm:px-[18px] py-[14px]">
      <span className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={hold.property.photo} alt="" width={112} height={112} className="w-full h-full object-cover" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif italic font-medium text-[17px] text-ink m-0 mb-1 tracking-[-0.01em] truncate">
          {hold.room.typeName} · <em className="not-italic">{hold.property.name}</em>
        </p>
        <p className="text-[13px] text-ink-soft m-0 oldstyle">
          {hold.stay.checkInLabel} → {hold.stay.checkOutLabel} · {hold.stay.nights} noches ·{" "}
          {hold.stay.adults} adultos
          {hold.stay.children > 0 ? ` · ${hold.stay.children} niños` : ""}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span
          className="font-serif font-medium text-[22px] text-ink block leading-[1.1] tracking-[-0.01em]"
          style={{ fontVariantNumeric: "tabular-nums oldstyle-nums", fontFeatureSettings: '"onum","tnum"' }}
        >
          {formatCOP(hold.totalCOP)}
        </span>
        {!compact && (
          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mt-1">
            COP total
          </span>
        )}
      </div>
      {!compact && (
        <Link
          href={`/p/${hold.property.slug}`}
          className="hidden sm:inline-flex self-center pl-4 ml-4 border-l border-rule text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage transition-colors"
        >
          Cambiar
        </Link>
      )}
    </div>
  );
}
