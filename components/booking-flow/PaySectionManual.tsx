"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import type { BookingHold, BankAccount } from "@/lib/booking-flow";
import { Countdown } from "./Countdown";
import { Dropzone } from "./Dropzone";
import { IconCopy, IconArrowRight } from "./icons";
import { IconWhatsApp } from "@/components/dashboard/icons";

export function PaySectionManual({
  hold,
  bank,
}: {
  hold: BookingHold;
  bank: BankAccount | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const hasFile = !!file;

  async function submitProof() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/public/payment-proof/${hold.id}`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        setUploadError(
          data.message ??
            (data.error === "too_large"
              ? "El archivo supera el limite de 10 MB."
              : "No pudimos subir el comprobante. Intenta de nuevo."),
        );
        return;
      }
      router.push(`/p/${hold.property.slug}/booking/${hold.id}/status`);
    } catch {
      setUploadError("Hubo un problema de conexion. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  async function copyAll() {
    if (!bank) return;
    const text = [
      `Banco: ${bank.bank}`,
      `Tipo de cuenta: ${bank.accountType}`,
      `Número: ${bank.accountNumber}`,
      `A nombre de: ${bank.holder}`,
      `${bank.holderDocType}: ${bank.holderDocNumber}`,
      `Referencia: ${hold.code}`,
      `Monto: ${formatCOP(hold.totalCOP)} COP`,
      ...(bank.notes ? [`Notas: ${bank.notes}`] : []),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  }

  if (!bank) {
    return (
      <article className="bg-paper border border-rule rounded-[28px] p-7 sm:p-12">
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-ink-muted tracking-[-0.02em]">
            {hold.code}
          </span>
          <Countdown expiresAt={hold.expiresAt} showHours />
        </div>
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
          Transferencia bancaria
        </span>
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-4 tracking-[-0.025em] leading-[1.1]">
          Solicita los datos al anfitrión.
        </h1>
        <p className="text-[15px] text-ink-soft leading-[1.6] m-0 mb-6 max-w-[52ch]">
          {hold.property.name} aún no publicó sus datos bancarios aquí. Contáctalos
          por WhatsApp para coordinar la transferencia. Mantenemos tu habitación
          reservada mientras tanto.
        </p>
        <a
          href={hold.property.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-14 rounded-[14px] bg-sage text-cream text-[15px] font-medium inline-flex items-center justify-center gap-2 hover:bg-[#4F6759] transition-colors"
        >
          <IconWhatsApp className="w-4 h-4" />
          Contactar por WhatsApp
        </a>
        <div className="mt-6 pt-6 border-t border-rule">
          <Link
            href={`/p/${hold.property.slug}/booking/new`}
            className="text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
          >
            ← Cambiar método de pago
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-paper border border-rule rounded-[28px] p-7 sm:p-12">
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono text-xs text-ink-muted tracking-[-0.02em]">{hold.code}</span>
        <Countdown expiresAt={hold.expiresAt} showHours />
      </div>

      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
        Confirma con transferencia
      </span>
      <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-0 tracking-[-0.025em] leading-[1.1]">
        Transfiere y sube tu comprobante.
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

      {/* Bank data block */}
      <section className="bg-linen rounded-2xl p-6 mt-6">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3.5">
          Datos para tu transferencia
        </span>
        <div className="flex flex-col gap-3.5">
          <BankRow label="Banco" value={bank.bank} />
          <BankRow label="Tipo de cuenta" value={bank.accountType} />
          <BankRow label="Número" value={bank.accountNumber} mono copyable />
          <BankRow label="A nombre de" value={bank.holder} />
          <BankRow label={bank.holderDocType} value={bank.holderDocNumber} mono copyable />
          <BankRow
            label="Referencia"
            value={hold.code}
            mono
            copyable
            helper="Incluye esto en el detalle de la transferencia para que la encontremos."
          />
          <BankRow label="Monto exacto" value={`${formatCOP(hold.totalCOP)} COP`} big />
          {bank.notes && (
            <BankRow
              label="Notas"
              value={bank.notes}
              helper="Instrucciones extras del anfitrión."
            />
          )}
        </div>

        <button
          type="button"
          onClick={copyAll}
          className="mt-[18px] w-full h-12 rounded-xl border border-sage text-sage bg-transparent hover:bg-sage-tint inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <IconCopy className="w-[14px] h-[14px]" />
          Copiar todos los datos
        </button>
      </section>

      <Dropzone onFile={(f) => setFile(f)} />

      <button
        type="button"
        disabled={!hasFile || uploading}
        onClick={submitProof}
        className="mt-[18px] w-full h-14 rounded-[14px] bg-sage text-cream text-[15px] font-medium inline-flex items-center justify-center gap-2 hover:bg-[#4F6759] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Subiendo…" : "Enviar comprobante"}
        {hasFile && !uploading && <IconArrowRight className="w-3.5 h-3.5" />}
      </button>
      {uploadError && (
        <p
          role="alert"
          className="mt-3 text-xs text-danger border border-danger/30 bg-danger/5 rounded-md px-3 py-2"
        >
          {uploadError}
        </p>
      )}

      <p className="mt-[18px] text-center text-[13px] text-ink-soft max-w-[44ch] mx-auto leading-[1.55]">
        Confirmaremos tu reserva en menos de 24 horas. Recibirás un WhatsApp y un email cuando esté lista. Mientras, mantenemos tu habitación reservada.
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
          ¿Necesitas ayuda?
        </a>
      </div>
    </article>
  );
}

function BankRow({
  label,
  value,
  mono = false,
  big = false,
  copyable = false,
  helper,
}: {
  label: string;
  value: string;
  mono?: boolean;
  big?: boolean;
  copyable?: boolean;
  helper?: string;
}) {
  return (
    <div
      className="grid items-baseline gap-3"
      style={{ gridTemplateColumns: "130px 1fr auto" }}
    >
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      <span
        className={[
          "text-ink",
          mono ? "font-mono text-[13px] tracking-[-0.02em]" : "font-serif font-medium",
          big ? "text-[22px]" : "text-base",
        ].join(" ")}
        style={
          !mono
            ? {
                fontVariantNumeric: "oldstyle-nums",
                fontFeatureSettings: '"onum"',
              }
            : undefined
        }
      >
        {value}
      </span>
      {copyable ? (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
            } catch {
              /* no-op */
            }
          }}
          aria-label={`Copiar ${label}`}
          className="w-7 h-7 rounded-lg text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconCopy className="w-[13px] h-[13px]" />
        </button>
      ) : (
        <span />
      )}
      {helper && (
        <span style={{ gridColumn: "2 / 4" }} className="text-xs text-ink-muted -mt-1">
          {helper}
        </span>
      )}
    </div>
  );
}
