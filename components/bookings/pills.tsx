import type { BookingStatus, BookingOrigin, BookingPayState } from "@/lib/bookings";
import { IconHouse } from "@/components/dashboard/icons";
import { IconHand } from "./icons";

export function StatusPill({ status, withDot = true }: { status: BookingStatus; withDot?: boolean }) {
  const map: Record<BookingStatus, { cls: string; dot: string; label: string; strike?: boolean }> = {
    confirmed: {
      cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
      dot: "bg-sage",
      label: "Confirmada",
    },
    pending: {
      cls: "bg-[rgba(184,146,62,0.14)] text-[#8A6E2E] border-[rgba(184,146,62,0.22)]",
      dot: "bg-gold",
      label: "Pago pendiente",
    },
    completed: {
      cls: "bg-linen text-ink-muted border-rule",
      dot: "bg-ink-muted",
      label: "Completada",
    },
    cancelled: {
      cls: "bg-linen text-ink-muted border-rule",
      dot: "bg-ink-muted",
      label: "Cancelada",
      strike: true,
    },
    "no-show": {
      cls: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
      dot: "bg-clay",
      label: "No show",
    },
  };
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center gap-[7px] px-3 py-[3px] rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border ${m.cls} ${
        m.strike ? "line-through decoration-[rgba(139,130,117,0.55)]" : ""
      }`}
    >
      {withDot && <span aria-hidden className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />}
      {m.label}
    </span>
  );
}

export function PayStatePill({ state }: { state: BookingPayState }) {
  const map: Record<BookingPayState, { cls: string; dot: string; label: string }> = {
    approved: {
      cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
      dot: "bg-sage",
      label: "Aprobado",
    },
    "waiting-receipt": {
      cls: "bg-[rgba(184,146,62,0.14)] text-[#8A6E2E] border-[rgba(184,146,62,0.22)]",
      dot: "bg-gold",
      label: "Esperando comprobante",
    },
    rejected: {
      cls: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
      dot: "bg-clay",
      label: "Rechazado",
    },
    refunded: {
      cls: "bg-linen text-ink-muted border-rule",
      dot: "bg-ink-muted",
      label: "Reembolsado",
    },
  };
  const m = map[state];
  return (
    <span
      className={`inline-flex items-center gap-[7px] px-3 py-[3px] rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border ${m.cls}`}
    >
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function OriginLabel({ origin }: { origin: BookingOrigin }) {
  if (origin === "direct") {
    return (
      <span className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft whitespace-nowrap">
        <span className="w-5 h-5 rounded-md bg-sage-tint text-sage inline-flex items-center justify-center">
          <IconHouse className="w-[11px] h-[11px]" />
        </span>
        Directo
      </span>
    );
  }
  if (origin === "booking") {
    return (
      <span className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft whitespace-nowrap">
        <span
          className="w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-semibold"
          style={{
            background: "rgba(0,53,128,0.08)",
            color: "#003580",
            border: "1px solid rgba(0,53,128,0.18)",
          }}
        >
          B.
        </span>
        Booking
      </span>
    );
  }
  if (origin === "airbnb") {
    return (
      <span className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft whitespace-nowrap">
        <span
          className="w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-semibold"
          style={{
            background: "rgba(255,90,95,0.08)",
            color: "#E04E54",
            border: "1px solid rgba(255,90,95,0.20)",
          }}
        >
          A.
        </span>
        Airbnb
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft whitespace-nowrap">
      <span className="w-5 h-5 rounded-md bg-linen text-ink-soft border border-rule inline-flex items-center justify-center">
        <IconHand className="w-[11px] h-[11px]" />
      </span>
      Manual
    </span>
  );
}
