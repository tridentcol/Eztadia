import type { Database } from "@/lib/supabase/database.types";

type BookingStatus = Database["public"]["Enums"]["BookingStatus"];
type PaymentMethod = Database["public"]["Enums"]["PaymentMethod"];
type PaymentStatus = Database["public"]["Enums"]["PaymentStatus"];

const STATUS_MAP: Record<BookingStatus, { cls: string; dot: string; label: string; strike?: boolean }> = {
  confirmed: {
    cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    dot: "bg-sage",
    label: "Confirmada",
  },
  pending_payment: {
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
  no_show: {
    cls: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
    dot: "bg-clay",
    label: "No show",
  },
};

export function BookingStatusPill({
  status,
  size = "sm",
}: {
  status: BookingStatus;
  size?: "xs" | "sm";
}) {
  const m = STATUS_MAP[status];
  const dims =
    size === "xs"
      ? "px-2 py-0.5 text-[10.5px]"
      : "px-3 py-[3px] text-[11px]";
  return (
    <span
      className={[
        "inline-flex items-center gap-[6px] rounded-full font-medium uppercase tracking-[0.05em] border whitespace-nowrap",
        dims,
        m.cls,
        m.strike ? "line-through decoration-[rgba(139,130,117,0.55)]" : "",
      ].join(" ")}
    >
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { cls: string; label: string }> = {
  pending:  { cls: "bg-[rgba(184,146,62,0.14)] text-[#8A6E2E] border-[rgba(184,146,62,0.22)]", label: "Pendiente" },
  approved: { cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]", label: "Aprobado" },
  declined: { cls: "bg-[rgba(168,72,60,0.12)] text-danger border-[rgba(168,72,60,0.22)]", label: "Rechazado" },
  voided:   { cls: "bg-linen text-ink-muted border-rule", label: "Anulado" },
  refunded: { cls: "bg-linen text-ink-muted border-rule", label: "Reembolsado" },
};

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  const m = PAYMENT_STATUS_MAP[status];
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium uppercase tracking-[0.05em] border whitespace-nowrap",
        m.cls,
      ].join(" ")}
    >
      {m.label}
    </span>
  );
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  pse: "PSE",
  manual_transfer: "Transferencia",
  external: "Externo",
  admin_override: "Admin",
};

export function paymentMethodLabel(m: PaymentMethod): string {
  return METHOD_LABEL[m];
}
