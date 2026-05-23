"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { BookingDetail } from "@/lib/bookings";
import { formatCOP } from "@/lib/format";
import { Close } from "@/components/icons";
import { Copy } from "@/components/property/PhosphorIcons";
import { ArrowRight } from "@/components/icons";
import { IconWhatsApp } from "@/components/dashboard/icons";
import { IconArrowDownLeft, IconArrowUpRight, IconFileText, FlagCO, FlagGeneric } from "./icons";
import { StatusPill, PayStatePill } from "./pills";

export function BookingDetailDrawer({
  detail,
  open,
  onClose,
}: {
  detail: BookingDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock while drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-hidden={!open}
        aria-label="Cerrar detalle"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-[80] transition-opacity duration-300 ease-organic cursor-default ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.18)" }}
      />

      {/* Drawer (desktop right slide / mobile bottom sheet) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={detail ? `Detalle de reserva ${detail.code}` : "Detalle de reserva"}
        className={[
          "fixed z-[90] bg-paper flex flex-col ease-organic transition-transform duration-[320ms]",
          // Mobile: bottom sheet
          "left-0 right-0 bottom-0 max-h-[92vh] rounded-t-[28px]",
          // Desktop: anchored right
          "md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[480px] md:max-h-none md:rounded-none md:border-l md:border-rule",
          // Open / closed transforms
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full",
        ].join(" ")}
        style={{ boxShadow: open ? "var(--shadow-drawer, var(--shadow-pop))" : "none" }}
      >
        {/* Mobile drag handle */}
        <span
          aria-hidden
          className="md:hidden block w-10 h-1 rounded-full bg-rule-strong mt-2.5 mb-1 mx-auto shrink-0"
        />

        {detail ? <DrawerInner detail={detail} onClose={onClose} /> : <DrawerSkeleton onClose={onClose} />}
      </aside>
    </>
  );
}

function DrawerInner({ detail, onClose }: { detail: BookingDetail; onClose: () => void }) {
  return (
    <>
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between gap-3 px-5 md:px-6 py-4 md:py-[18px] border-b border-rule bg-paper">
        <div className="inline-flex items-center gap-3">
          <span className="font-mono text-[12.5px] text-ink-muted tracking-[-0.01em] font-medium">
            {detail.code}
          </span>
          <StatusPill status={detail.status} />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <Close className="w-[18px] h-[18px]" />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Guest */}
        <Section>
          <div className="flex flex-col gap-1 mb-5">
            {detail.guest.photo ? (
              <span className="w-16 h-16 rounded-full overflow-hidden bg-sage-tint inline-block mb-2.5">
                <Image src={detail.guest.photo} alt="" width={128} height={128} className="w-full h-full object-cover" />
              </span>
            ) : (
              <span
                aria-hidden
                className="w-16 h-16 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-[22px] font-medium mb-2.5"
              >
                {detail.guest.initials}
              </span>
            )}
            <h2 className="font-serif italic font-medium text-[28px] text-ink m-0 leading-[1.1] tracking-[-0.02em]">
              {detail.guest.name}
            </h2>
            <p className="text-[13px] text-ink-muted m-0 mt-1">
              {detail.guestInfo.note ? `${detail.guestInfo.note} · ` : ""}
              {detail.guestInfo.country}
            </p>
          </div>

          <PairList>
            <Pair label="Documento">
              <span className="font-mono text-[12px] tracking-[-0.02em]">
                {detail.guestInfo.documentType} {detail.guestInfo.document}
              </span>
              <CopyBtn label="Copiar documento" />
            </Pair>
            <Pair label="Email">
              {detail.guestInfo.email}
              <CopyBtn label="Copiar email" />
            </Pair>
            <Pair label="Teléfono">
              <span className="oldstyle">{detail.guestInfo.phone}</span>
              <a
                href={`https://wa.me/${detail.guestInfo.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-sage bg-sage-tint px-2.5 py-[3px] rounded-full hover:bg-[rgba(92,117,103,0.18)] transition-colors"
              >
                <IconWhatsApp className="w-3 h-3" />
                WhatsApp
              </a>
            </Pair>
            <Pair label="País">
              {detail.guestInfo.countryCode === "CO" ? (
                <FlagCO className="rounded-sm overflow-hidden border border-rule" />
              ) : (
                <FlagGeneric className="rounded-sm overflow-hidden border border-rule" />
              )}
              {detail.guestInfo.country}
            </Pair>
          </PairList>
        </Section>

        {/* Estancia */}
        <Section>
          <Overline>Estancia</Overline>

          <div className="bg-linen rounded-[14px] p-5 mb-5">
            <p className="font-serif italic font-medium text-[18px] text-ink m-0 mb-2 tracking-[-0.015em]">
              {detail.roomType} · Habitación <span className="oldstyle">{detail.roomNumber}</span>
            </p>
            <p
              className="font-serif font-medium text-[22px] text-ink m-0 inline-flex items-center gap-2.5 leading-none tracking-[-0.015em]"
              style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
            >
              {detail.checkIn.dayLabelShort}
              <svg
                className="w-[18px] h-[18px] text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
              {detail.checkOut.dayLabelShort}
            </p>
            <p className="text-[13px] text-ink-muted mt-2 m-0">
              <span className="oldstyle">{detail.stay.nights}</span> noches ·{" "}
              <span className="oldstyle">{detail.stay.adults}</span> adultos ·{" "}
              <span className="oldstyle">{detail.stay.children}</span> niños
            </p>
          </div>

          <PairList>
            <Pair label="Check-in">
              <span className="oldstyle">
                {detail.checkIn.dayLabelLong} {detail.checkIn.dayLabelShort}, {detail.stay.checkInTime}
              </span>
            </Pair>
            <Pair label="Check-out">
              <span className="oldstyle">
                {detail.checkOut.dayLabelLong} {detail.checkOut.dayLabelShort}, {detail.stay.checkOutTime}
              </span>
            </Pair>
            <Pair label="Habitación">
              <span>
                <span className="oldstyle">{detail.roomNumber}</span> · Piso{" "}
                <span className="oldstyle">{detail.stay.floor}</span>
              </span>
            </Pair>
            <Pair label="Estancia">
              <span>
                <span className="oldstyle">{detail.stay.nights}</span> noches
              </span>
            </Pair>
          </PairList>
        </Section>

        {/* Pago */}
        <Section>
          <Overline>Pago</Overline>
          <PairList>
            <Pair label="Monto total">
              <span
                className="font-serif font-medium text-[22px] text-ink leading-none tracking-[-0.01em]"
                style={{
                  fontVariantNumeric: "tabular-nums oldstyle-nums",
                  fontFeatureSettings: '"onum","tnum"',
                }}
              >
                {formatCOP(detail.totalCOP)}
              </span>
              <span className="text-[12px] uppercase tracking-[0.08em] text-ink-muted font-medium ml-1">COP</span>
            </Pair>
            <Pair label="Método">{detail.payment.method}</Pair>
            <Pair label="Estado">
              <PayStatePill state={detail.payment.state} />
            </Pair>

            {detail.payment.ref && (
              <Pair label="Ref. Wompi">
                <span className="font-mono text-[12px] tracking-[-0.02em]">{detail.payment.ref}</span>
                <CopyBtn label="Copiar referencia" />
              </Pair>
            )}
            {detail.payment.paidAt && (
              <Pair label="Pagado el">
                <span className="oldstyle">{detail.payment.paidAt}</span>
              </Pair>
            )}

            {detail.payment.receipt && (
              <Pair label="Comprobante recibido">
                <a
                  className="block mt-1.5 w-[120px] h-[84px] rounded-[10px] border border-rule relative"
                  style={{ background: "linear-gradient(135deg, #F5E3D9 0%, #FBF8F2 100%)" }}
                >
                  <IconFileText
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-clay"
                    style={{ width: 28, height: 28 }}
                  />
                  <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-medium tracking-[0.06em] uppercase text-ink-muted text-left">
                    {detail.payment.receipt.filename}
                  </span>
                </a>
              </Pair>
            )}
          </PairList>

          {detail.payment.state === "waiting-receipt" && (
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                className="flex-[1.5] h-10 px-4 rounded-xl bg-terracotta text-cream text-sm font-medium hover:bg-clay transition-colors"
              >
                Confirmar pago
              </button>
              <button
                type="button"
                className="flex-1 h-10 px-4 rounded-xl bg-transparent text-danger border border-[rgba(168,72,60,0.25)] text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
              >
                Rechazar pago
              </button>
            </div>
          )}
        </Section>

        {/* Comunicación */}
        <Section>
          <Overline>Comunicación</Overline>
          <div className="flex flex-col gap-2.5 mb-4">
            {detail.messages.slice(0, 3).map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-3 border ${
                  m.direction === "out"
                    ? "bg-sage-tint border-[rgba(92,117,103,0.15)]"
                    : "bg-linen border-transparent"
                }`}
              >
                <div
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] mb-1 ${
                    m.direction === "out" ? "text-sage" : "text-ink-muted"
                  }`}
                >
                  {m.direction === "out" ? (
                    <IconArrowUpRight className="w-[11px] h-[11px]" />
                  ) : (
                    <IconArrowDownLeft className="w-[11px] h-[11px]" />
                  )}
                  {m.direction === "out" ? `Enviado · ${m.party}` : `Recibido · ${m.party}`}
                </div>
                <p className="text-sm text-ink leading-[1.5] m-0 line-clamp-2">{m.body}</p>
                <p className="text-[11px] text-ink-muted mt-1.5 m-0 oldstyle">
                  {m.ageLabel} · {m.at}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full h-10 rounded-xl border border-sage bg-transparent text-sage text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-sage-tint transition-colors"
          >
            <IconWhatsApp className="w-3.5 h-3.5" />
            Enviar mensaje por WhatsApp
          </button>
        </Section>

        {/* Historial */}
        <Section>
          <Overline>Historial</Overline>
          <div className="relative pl-[22px]">
            <span aria-hidden className="absolute left-[5px] top-2 bottom-2 w-px bg-rule" />
            {detail.history.map((ev, i) => (
              <div key={i} className={`relative pb-[18px] last:pb-0`}>
                <span
                  aria-hidden
                  className={`absolute -left-[22px] top-1 w-[11px] h-[11px] rounded-full border-[2.5px] border-paper ${
                    ev.tone === "future"
                      ? "bg-paper"
                      : ev.tone === "muted"
                        ? "bg-ink-muted"
                        : "bg-sage"
                  }`}
                  style={{
                    boxShadow: ev.tone === "future" ? "0 0 0 1px var(--color-sage)" : "0 0 0 1px var(--color-rule)",
                  }}
                />
                <p className="font-serif italic font-medium text-[14.5px] text-ink leading-[1.25] m-0 tracking-[-0.005em]">
                  {ev.title}
                </p>
                <p className="text-[12px] text-ink-muted mt-1 m-0 oldstyle">
                  {ev.at}
                  {ev.meta ? ` · ${ev.meta}` : ""}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer (sticky) */}
      <footer className="shrink-0 flex gap-2.5 px-5 md:px-6 py-4 border-t border-rule bg-paper">
        <button
          type="button"
          className="flex-1 h-[42px] px-4 rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          Modificar
        </button>
        <button
          type="button"
          className="flex-1 h-[42px] px-4 rounded-xl bg-transparent text-danger border border-[rgba(168,72,60,0.25)] text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
        >
          Cancelar reserva
        </button>
        <button
          type="button"
          className="flex-[1.5] h-[42px] px-4 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] inline-flex items-center justify-center gap-2 transition-colors"
        >
          Enviar bienvenida
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </footer>
    </>
  );
}

/* ─── primitives ─── */
function Section({ children }: { children: React.ReactNode }) {
  return <section className="p-6 border-t border-rule first:border-t-0">{children}</section>;
}

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#8A6E2E] mb-3.5">
      {children}
    </span>
  );
}

function PairList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Pair({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      <span className="inline-flex items-center gap-2 flex-wrap text-sm text-ink">
        {children}
      </span>
    </div>
  );
}

function CopyBtn({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-[26px] h-[26px] rounded-[7px] text-ink-muted hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
    >
      <Copy className="w-[13px] h-[13px]" />
    </button>
  );
}

function DrawerSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <header className="shrink-0 flex items-center justify-between gap-3 px-6 py-[18px] border-b border-rule bg-paper">
        <span className="h-3 w-32 rounded bg-linen" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen inline-flex items-center justify-center"
        >
          <Close className="w-[18px] h-[18px]" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {[64, 24, 18, 16, 16, 16].map((h, i) => (
          <span key={i} className="block rounded bg-linen" style={{ height: h, width: `${100 - i * 8}%` }} aria-hidden />
        ))}
      </div>
    </>
  );
}
