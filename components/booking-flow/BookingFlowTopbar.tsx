import Link from "next/link";
import { IconChevronLeft } from "./icons";
import type { BookingHold } from "@/lib/booking-flow";

export function BookingFlowTopbar({
  hold,
  showBack = true,
}: {
  hold: BookingHold;
  showBack?: boolean;
}) {
  return (
    <header className="h-16 border-b border-rule bg-cream flex items-center justify-between px-5 sm:px-14">
      <div className="inline-flex items-center gap-4">
        {showBack && (
          <Link
            href={`/p/${hold.property.slug}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
        )}
        {showBack && <span aria-hidden className="w-px h-5 bg-rule hidden sm:inline-block" />}
        <span className="font-serif italic font-medium text-[18px] text-ink tracking-[-0.01em]">
          {hold.property.name} <span className="text-ink-soft font-normal not-italic">· {hold.property.city}</span>
        </span>
      </div>
      <div className="inline-flex items-center gap-4">
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
          <button className="text-ink">ES</button>
          <span className="opacity-40">·</span>
          <button>EN</button>
        </div>
        <a
          href={hold.property.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage transition-colors"
        >
          ¿Necesitas ayuda?
        </a>
      </div>
    </header>
  );
}
