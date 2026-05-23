"use client";

import { useState } from "react";
import Link from "next/link";
import type { Integrations } from "@/lib/integrations";
import { IconWhatsApp } from "@/components/dashboard/icons";

const ARROW = (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const CHECK = (
  <svg className="w-3.5 h-3.5 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function StatusPill({ status }: { status: "connected" | "partial" | "disconnected" }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-sage-tint text-sage border border-[rgba(92,117,103,0.18)]">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage" />
        Conectada
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)]">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold" />
        Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-linen text-ink-muted border border-rule">
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
      Desconectada
    </span>
  );
}

function CardShell({
  status,
  children,
}: {
  status: "connected" | "partial" | "disconnected";
  children: React.ReactNode;
}) {
  const baseCls = "relative bg-paper rounded-[24px] p-7 sm:p-8 flex flex-col overflow-hidden";
  const ringCls =
    status === "connected"
      ? "border-[1.5px] border-sage"
      : status === "partial"
        ? "border-[1.5px] border-[rgba(184,146,62,0.5)]"
        : "border border-rule";

  const bg =
    status === "connected"
      ? "radial-gradient(at 0% 0%, var(--color-sage-tint) 0%, transparent 35%), var(--color-paper)"
      : status === "partial"
        ? "radial-gradient(at 0% 0%, rgba(184,146,62,0.14) 0%, transparent 35%), var(--color-paper)"
        : "var(--color-paper)";

  return (
    <article className={`${baseCls} ${ringCls}`} style={{ background: bg }}>
      {children}
    </article>
  );
}

export function WompiCard({ data }: { data: Integrations["wompi"] }) {
  return (
    <CardShell status={data.status}>
      <div className="flex items-center justify-between mb-[18px]">
        <span
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-white font-bold text-[14px] tracking-[0.04em]"
          style={{ background: "linear-gradient(135deg, #21B563 0%, #0F8A48 100%)" }}
        >
          Wompi
        </span>
        <StatusPill status={data.status} />
      </div>
      <h3 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-3 tracking-[-0.015em]">
        Wompi · Pagos PSE
      </h3>
      <p className="text-sm text-ink-soft leading-[1.55] m-0 mb-4">
        Recibe pagos vía PSE de cualquier banco colombiano. Confirmación automática vía webhook. Comisión {data.commissionLabel}.
      </p>
      <ul className="list-none p-0 m-0 mb-[18px] flex flex-col gap-1.5">
        {data.features.map((f, i) => (
          <li key={i} className="inline-flex items-center gap-2 text-xs text-ink-muted">
            {CHECK}
            {f}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-ink-muted m-0 mb-[18px] tracking-[0.02em]">
        Conectada el <span className="oldstyle">{data.connectedAtLabel}</span> · Modo{" "}
        {data.mode === "production" ? "producción" : "sandbox"}
      </p>
      <Link
        href="/dashboard/integrations/wompi"
        className="mt-auto inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sage border border-sage bg-transparent text-sm font-medium hover:bg-sage-tint transition-colors"
      >
        Editar configuración {ARROW}
      </Link>
    </CardShell>
  );
}

export function WhatsAppCard({ data }: { data: Integrations["whatsapp"] }) {
  const pct = Math.round((data.monthlyUsed / data.monthlyFreeCap) * 1000) / 10;
  return (
    <CardShell status={data.status}>
      <div className="flex items-center justify-between mb-[18px]">
        <span className="inline-flex items-center gap-2 text-[#128C7E] font-bold text-base">
          <IconWhatsApp className="w-[26px] h-[26px]" />
          WhatsApp
        </span>
        <StatusPill status={data.status} />
      </div>
      <h3 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-3 tracking-[-0.015em]">
        WhatsApp Cloud API
      </h3>
      <p className="text-sm text-ink-soft leading-[1.55] m-0 mb-4">
        Envía confirmaciones, recordatorios y responde mensajes de huéspedes desde tu dashboard. API oficial de Meta — sin riesgo de ban.
      </p>
      <ul className="list-none p-0 m-0 mb-[18px] flex flex-col gap-1.5">
        <li className="inline-flex items-center gap-2 text-xs text-ink-muted">
          {CHECK}
          Plantillas aprobadas{" "}
          <span className="oldstyle ml-0.5">
            ({data.templatesApproved}/{data.templatesTotal})
          </span>
        </li>
        <li className="inline-flex items-center gap-2 text-xs text-ink-muted">
          {CHECK}
          <span>
            <span className="oldstyle">{data.monthlyUsed}</span> mensajes este mes{" "}
            <span className="text-ink-muted ml-0.5">
              (de <span className="oldstyle">{data.monthlyFreeCap.toLocaleString("es-CO")}</span> gratis)
            </span>
          </span>
        </li>
      </ul>

      <div className="mb-4">
        <div className="h-1 bg-linen rounded-full overflow-hidden">
          <span aria-hidden className="block h-full bg-sage rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-ink-muted">
          <span className="oldstyle">{pct.toString().replace(".", ",")}</span>% del cupo gratis usado
        </p>
      </div>

      <p className="text-[11px] text-ink-muted m-0 mb-[18px] tracking-[0.02em]">
        Phone: <span className="oldstyle">{data.phone}</span>
      </p>
      <Link
        href="/dashboard/integrations/whatsapp"
        className="mt-auto inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sage border border-sage bg-transparent text-sm font-medium hover:bg-sage-tint transition-colors"
      >
        {data.status === "disconnected" ? "Conectar" : "Editar configuración"} {ARROW}
      </Link>
    </CardShell>
  );
}

export function IcalCard({ data }: { data: Integrations["ical"] }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(data.outgoingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }

  return (
    <CardShell status={data.status}>
      <div className="flex items-center justify-between mb-[18px]">
        <span className="inline-flex items-center gap-2 text-gold-dark font-bold text-[14px] tracking-[0.02em]">
          <svg className="w-[30px] h-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x={3} y={5} width={18} height={16} rx={2} />
            <path d="M3 9h18" />
            <path d="m8 14 2 2 4-4" />
            <path d="M16 18l3-3" />
            <path d="m16 14 3 3" />
          </svg>
          iCal Sync
        </span>
        <StatusPill status={data.status} />
      </div>
      <h3 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-3 tracking-[-0.015em]">
        iCal Sync
      </h3>
      <p className="text-sm text-ink-soft leading-[1.55] m-0 mb-4">
        Importa y exporta reservas desde otras plataformas. Sync automático cada{" "}
        <span className="oldstyle">{data.syncEveryMinutes}</span> minutos. Cero overbookings.
      </p>

      <section className="mb-4">
        <span className="block text-[10px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Importar — feeds entrantes
        </span>
        <div className="flex flex-col">
          {data.incoming.map((f) => (
            <div key={f.id} className="flex items-center gap-2 py-1.5 text-[12.5px] text-ink-soft">
              {CHECK}
              <span className="flex-1 min-w-0 truncate">{f.label}</span>
              <span className="text-[11px] text-ink-muted shrink-0 oldstyle">{f.lastSyncedAgo}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sage text-[13px] font-medium hover:bg-sage-tint transition-colors"
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Agregar feed
        </button>
      </section>

      <section className="mb-5">
        <span className="block text-[10px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Exportar — tu feed saliente
        </span>
        <div className="flex items-center gap-2 bg-linen rounded-[10px] px-3 py-2.5 mb-2">
          <span className="flex-1 min-w-0 font-mono text-[11px] text-ink-soft tracking-[-0.01em] truncate">
            {data.outgoingUrl}
          </span>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copiar URL"
            className="w-7 h-7 rounded-md text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x={8} y={8} width={13} height={13} rx={2} />
              <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-ink-muted leading-[1.55] m-0">
          {copied
            ? "URL copiada."
            : "Pega esta URL en Booking, Airbnb u otra plataforma para que vean tu disponibilidad en tiempo real."}
        </p>
      </section>

      <Link
        href="/dashboard/integrations/ical"
        className="mt-auto inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sage border border-sage bg-transparent text-sm font-medium hover:bg-sage-tint transition-colors"
      >
        Ver / editar feeds {ARROW}
      </Link>
    </CardShell>
  );
}
