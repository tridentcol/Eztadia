"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CalendarBooking } from "@/lib/calendar";
import { statusLabel } from "@/lib/calendar";
import { formatCOP } from "@/lib/format";

export function BookingPopover({
  booking,
  anchorRect,
  onClose,
}: {
  booking: CalendarBooking;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const popW = 320;
    const popH = ref.current.offsetHeight;
    let left = anchorRect.left + anchorRect.width / 2 - popW / 2;
    let top = anchorRect.bottom + 8;
    left = Math.max(12, Math.min(window.innerWidth - popW - 12, left));
    if (top + popH > window.innerHeight - 12) {
      top = anchorRect.top - popH - 8;
    }
    setPos({ top, left });
  }, [anchorRect, booking.id]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer to next tick so the opening click doesn't immediately close us
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onClick);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  const isExt = booking.status === "external" || booking.status === "manual-block";
  const initials = (booking.name || booking.surname || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
  const displayName = booking.name || booking.source || booking.label || booking.surname || "";
  const pillTone = {
    confirmed: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    pending: "bg-[rgba(184,146,62,0.14)] text-gold border-[rgba(184,146,62,0.18)]",
    hold: "bg-linen text-ink-soft border-rule",
    external: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
    "manual-block": "bg-[rgba(139,130,117,0.15)] text-ink-soft border-[rgba(139,130,117,0.25)]",
  }[booking.status];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Detalle de reserva"
      className="fixed bg-paper border border-rule rounded-2xl p-5 z-[50] w-[320px] max-w-[320px]"
      style={{
        top: pos.top,
        left: pos.left,
        boxShadow: "var(--shadow-pop)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="inline-flex items-center gap-2.5">
          {!isExt && (
            <span
              aria-hidden
              className="w-8 h-8 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-xs font-medium"
            >
              {initials}
            </span>
          )}
          <span className="font-serif italic font-medium text-ink text-base tracking-[-0.01em]">
            {displayName}
          </span>
        </div>
        <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[10px] font-medium tracking-[0.05em] uppercase border ${pillTone}`}>
          {statusLabel(booking.status)}
        </span>
      </div>

      <dl
        className="grid pt-3.5 mb-4 border-t border-rule"
        style={{ gridTemplateColumns: "auto 1fr", gap: "6px 14px" }}
      >
        <Row label="Fechas">
          <span className="oldstyle">{booking.start} – {booking.end - 1} mayo</span> · <span className="oldstyle">{booking.end - booking.start}</span> noches
        </Row>
        <Row label="Habitación">{booking.room}</Row>
        {booking.total != null && (
          <Row label="Total">
            COP <span className="oldstyle">{formatCOP(booking.total)}</span>
          </Row>
        )}
        {booking.pay && <Row label="Pago">{booking.pay}</Row>}
        {booking.code && (
          <>
            <dt className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">Código</dt>
            <dd className="text-xs text-ink m-0 mono font-mono">{booking.code}</dd>
          </>
        )}
        {booking.guests != null && (
          <Row label="Huéspedes">
            <span className="oldstyle">{booking.guests}</span> personas
          </Row>
        )}
      </dl>

      <div className="flex gap-2 flex-wrap">
        {booking.status === "manual-block" ? (
          <>
            <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-cream text-ink-soft border border-rule text-xs font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors">
              Editar bloqueo
            </button>
            <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-transparent text-clay border border-[rgba(199,111,76,0.22)] text-xs font-medium hover:bg-[rgba(199,111,76,0.08)] transition-colors">
              Eliminar
            </button>
          </>
        ) : booking.status === "external" ? (
          <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-cream text-ink-soft border border-rule text-xs font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors">
            Ver en {booking.source}
          </button>
        ) : (
          <>
            <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-sage text-cream text-xs font-medium hover:bg-[#4F6759] transition-colors">
              Ver detalle
            </button>
            <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-cream text-ink-soft border border-rule text-xs font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors">
              WhatsApp
            </button>
            <button type="button" className="flex-1 h-8 px-3 rounded-lg bg-transparent text-clay border border-[rgba(199,111,76,0.22)] text-xs font-medium hover:bg-[rgba(199,111,76,0.08)] transition-colors">
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">{label}</dt>
      <dd className="text-[13px] text-ink m-0">{children}</dd>
    </>
  );
}
