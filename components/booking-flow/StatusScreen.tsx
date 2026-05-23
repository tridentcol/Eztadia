import Link from "next/link";
import { formatCOP } from "@/lib/format";
import type { BookingHold, StatusVariant } from "@/lib/booking-flow";
import {
  IconCheckSimple,
  IconClock,
  IconClose,
  IconCalendarPlus,
  IconMapPinSm,
  IconArrowRight,
} from "./icons";
import { IconWhatsApp } from "@/components/dashboard/icons";

export function StatusScreen({
  hold,
  variant,
}: {
  hold: BookingHold;
  variant: StatusVariant;
}) {
  if (variant === "confirmed") return <Confirmed hold={hold} />;
  if (variant === "waiting") return <Waiting hold={hold} />;
  return <Failed hold={hold} />;
}

function Confirmed({ hold }: { hold: BookingHold }) {
  return (
    <div className="max-w-[560px] mx-auto px-8 py-20 text-center status-fade-in">
      <Ornament tone="sage">
        <IconCheckSimple className="w-[38px] h-[38px]" />
      </Ornament>

      <h1 className="font-serif italic font-medium text-[clamp(32px,5vw,40px)] text-ink m-0 mb-4 tracking-[-0.025em] leading-[1.05]">
        Listo. <em className="italic">Te esperamos.</em>
      </h1>
      <p className="text-[17px] leading-[1.55] text-ink-soft max-w-[44ch] mx-auto m-0 mb-10">
        Tu <em className="italic">{hold.room.typeName}</em> queda lista para el{" "}
        <span className="oldstyle">{hold.stay.checkInLabel}</span>. Te enviamos los detalles a tu email y un mensaje a tu WhatsApp.
      </p>

      <DataGrid>
        <DataCell label="Código" value={hold.code} mono />
        <DataCell
          label="Check-in"
          value={`${hold.stay.checkInLabel} · ${hold.stay.checkInTime}`}
        />
        <DataCell
          label="Check-out"
          value={`${hold.stay.checkOutLabel} · ${hold.stay.checkOutTime}`}
        />
        <DataCell
          label="Total pagado"
          value={
            <>
              {formatCOP(hold.totalCOP)}{" "}
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
                COP
              </span>
            </>
          }
        />
      </DataGrid>

      <div className="flex gap-2.5 justify-center mb-8 flex-wrap">
        <a
          href={`#calendar-ics?code=${hold.code}`}
          className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          <IconCalendarPlus className="w-3.5 h-3.5" />
          Agregar al calendario
        </a>
        <a
          href={`https://www.google.com/maps?q=Casa+Marina+Cartagena`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          <IconMapPinSm className="w-3.5 h-3.5" />
          Indicaciones para llegar
        </a>
      </div>

      <p className="text-[13px] leading-[1.55] text-ink-muted max-w-[44ch] mx-auto">
        Si tienes alguna pregunta o necesitas algo, escríbenos por WhatsApp al{" "}
        <a
          href={hold.property.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sage underline underline-offset-[3px] oldstyle"
        >
          {hold.property.whatsapp}
        </a>
        . Estaremos aquí cuando llegues.
      </p>

      <style>{statusFadeKeyframes}</style>
    </div>
  );
}

function Waiting({ hold }: { hold: BookingHold }) {
  return (
    <div className="max-w-[560px] mx-auto px-8 py-20 text-center status-fade-in">
      <Ornament tone="gold" spinning>
        <IconClock className="w-[38px] h-[38px]" />
      </Ornament>
      <h1 className="font-serif font-medium text-[32px] text-ink m-0 mb-4 tracking-[-0.025em] leading-[1.05]">
        Recibimos tu comprobante.
      </h1>
      <p className="text-base leading-[1.55] text-ink-soft max-w-[44ch] mx-auto m-0 mb-10">
        <em className="italic">{hold.property.name}</em> lo revisará y te confirmará en menos de 24 horas. Mientras, tu habitación queda reservada a tu nombre.
      </p>

      <DataGrid>
        <DataCell label="Código" value={hold.code} mono />
        <DataCell label="Habitación" value={`${hold.room.typeName} · ${hold.room.number}`} />
        <DataCell
          label="Fechas"
          value={`${hold.stay.checkInLabel} → ${hold.stay.checkOutLabel}`}
        />
        <DataCell label="Total" value={formatCOP(hold.totalCOP)} />
      </DataGrid>

      <p className="text-[13px] text-ink-muted">
        <Link href={`/p/${hold.property.slug}`} className="text-sage underline underline-offset-[3px]">
          Volver al inicio
        </Link>
      </p>
      <style>{statusFadeKeyframes}</style>
    </div>
  );
}

function Failed({ hold }: { hold: BookingHold }) {
  return (
    <div className="max-w-[560px] mx-auto px-8 py-20 text-center status-fade-in">
      <Ornament tone="terra">
        <IconClose className="w-[38px] h-[38px]" />
      </Ornament>
      <h1 className="font-serif font-medium text-[32px] text-ink m-0 mb-4 tracking-[-0.025em] leading-[1.05]">
        No pudimos confirmar tu reserva.
      </h1>
      <p className="text-base leading-[1.55] text-ink-soft max-w-[44ch] mx-auto m-0 mb-10">
        El pago no se completó a tiempo. Tu habitación volvió a quedar disponible. Puedes intentarlo de nuevo si todavía hay cupos.
      </p>
      <div className="flex gap-2.5 justify-center flex-wrap">
        <Link
          href={`/p/${hold.property.slug}/booking/new`}
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-terracotta text-cream text-sm font-medium hover:bg-clay transition-colors"
        >
          Intentar de nuevo
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href={hold.property.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          <IconWhatsApp className="w-3.5 h-3.5" />
          Escribir a {hold.property.name}
        </a>
      </div>
      <style>{statusFadeKeyframes}</style>
    </div>
  );
}

function Ornament({
  tone,
  spinning,
  children,
}: {
  tone: "sage" | "gold" | "terra";
  spinning?: boolean;
  children: React.ReactNode;
}) {
  const cls = {
    sage: "bg-sage-tint text-sage after:border-[rgba(92,117,103,0.18)]",
    gold: "bg-[rgba(184,146,62,0.14)] text-gold-dark after:border-[rgba(184,146,62,0.22)]",
    terra: "bg-[rgba(199,111,76,0.12)] text-clay after:border-[rgba(199,111,76,0.22)]",
  }[tone];
  return (
    <span
      aria-hidden
      className={[
        "inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 relative",
        "after:content-[''] after:absolute after:-inset-[10px] after:rounded-full after:border",
        cls,
        spinning ? "[&>svg]:animate-spin-slow" : "",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function DataGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-2 text-left border-t border-b border-rule mb-8"
      role="group"
      aria-label="Detalles de la reserva"
    >
      {children}
    </div>
  );
}

function DataCell({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="p-[18px_20px] border-rule [&:nth-child(3)]:border-t [&:nth-child(4)]:border-t [&:nth-child(even)]:border-l">
      <span className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-muted mb-1.5">
        {label}
      </span>
      <span
        className={[
          "font-serif font-medium text-[22px] text-ink leading-[1.05] tracking-[-0.015em]",
          mono ? "font-mono text-[14px] tracking-[-0.01em]" : "",
        ].join(" ")}
        style={
          !mono
            ? { fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }
            : undefined
        }
      >
        {value}
      </span>
    </div>
  );
}

const statusFadeKeyframes = `
  @keyframes status-fade-in {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to   { opacity: 1; transform: none; }
  }
  .status-fade-in { animation: status-fade-in 400ms cubic-bezier(0.32, 0.72, 0, 1) both; }
  @keyframes spin-slow { to { transform: rotate(360deg); } }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .status-fade-in, .animate-spin-slow { animation: none !important; }
  }
`;
