"use client";

import { useEffect, useState } from "react";
import { DEMO_BACKUP_CODES, DEMO_TOTP_SECRET } from "@/lib/personal-settings";
import { OTPInput } from "@/components/auth/OTPInput";
import { IconClose, IconCopy } from "./icons";

type Step = 1 | 2 | 3;

export function TwoFAModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [code, setCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCode("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(DEMO_TOTP_SECRET);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 1500);
    } catch {
      /* noop */
    }
  }

  async function copyAllCodes() {
    try {
      await navigator.clipboard.writeText(DEMO_BACKUP_CODES.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 1500);
    } catch {
      /* noop */
    }
  }

  function downloadCodes() {
    const blob = new Blob([DEMO_BACKUP_CODES.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eztadia-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8 overflow-y-auto">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="twofa-title"
        className="relative z-[101] w-full max-w-[540px] bg-paper rounded-[28px] p-8 sm:p-10"
        style={{ boxShadow: "var(--shadow-modal, var(--shadow-pop))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconClose className="w-4 h-4" />
        </button>

        <MiniStepper current={step} />

        {step === 1 && (
          <Step1
            onContinue={() => setStep(2)}
            onCopySecret={copySecret}
            copied={copiedSecret}
          />
        )}
        {step === 2 && (
          <Step2
            code={code}
            onChange={setCode}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            onBack={() => setStep(2)}
            onFinish={() => {
              onComplete();
              onClose();
            }}
            onCopyAll={copyAllCodes}
            onDownload={downloadCodes}
            copied={copiedCodes}
          />
        )}
      </div>
    </div>
  );
}

function MiniStepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {[1, 2, 3].map((n, i) => {
        const isDone = n < current;
        const isCurrent = n === current;
        return (
          <div key={n} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={[
                "relative w-2 h-2 rounded-full",
                isDone || isCurrent ? "bg-sage" : "bg-transparent border-[1.5px] border-ink-muted",
                isCurrent
                  ? "after:content-[''] after:absolute after:-inset-1 after:rounded-full after:border-2 after:border-sage-tint"
                  : "",
              ].join(" ")}
            />
            {i < 2 && (
              <span aria-hidden className={`w-8 h-px ${isDone ? "bg-sage" : "bg-rule"}`} />
            )}
          </div>
        );
      })}
      <span className="ml-auto text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        <span className="text-sage">Paso {current}</span> · de 3
      </span>
    </div>
  );
}

function Step1({
  onContinue,
  onCopySecret,
  copied,
}: {
  onContinue: () => void;
  onCopySecret: () => void;
  copied: boolean;
}) {
  return (
    <>
      <h2 className="font-serif italic font-medium text-[24px] text-ink m-0 mb-2.5 tracking-[-0.02em]" id="twofa-title">
        Escanea con tu app de autenticación
      </h2>
      <p className="text-sm text-ink-soft m-0 mb-6 leading-[1.55]">
        Usa <em className="italic">Google Authenticator</em>, <em className="italic">Authy</em>,{" "}
        <em className="italic">1Password</em> o cualquier otra app TOTP compatible.
      </p>

      <div className="bg-linen rounded-[20px] p-8 flex items-center justify-center mb-[18px]">
        <FakeQR />
      </div>

      <div className="flex items-center gap-2 bg-linen rounded-xl px-3.5 py-3 mb-6">
        <span className="flex-1 text-[12.5px] text-ink-soft leading-[1.45]">
          ¿No puedes escanear? Código manual:{" "}
          <span className="font-mono text-[13px] text-ink ml-1 tracking-[-0.01em]">
            {DEMO_TOTP_SECRET}
          </span>
        </span>
        <button
          type="button"
          onClick={onCopySecret}
          aria-label="Copiar código manual"
          className="w-[30px] h-[30px] rounded-lg text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconCopy className="w-3.5 h-3.5" />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-sage mb-3 -mt-3">Código copiado al portapapeles.</p>
      )}

      <div className="flex justify-between items-center mt-7">
        <button
          type="button"
          onClick={() => {
            /* close by parent */
          }}
          disabled
          className="text-sm font-medium text-ink-muted opacity-0 pointer-events-none"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors"
        >
          Continuar
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </>
  );
}

function Step2({
  code,
  onChange,
  onBack,
  onContinue,
}: {
  code: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <h2 className="font-serif italic font-medium text-[24px] text-ink m-0 mb-2.5 tracking-[-0.02em]" id="twofa-title">
        Confirma que funciona
      </h2>
      <p className="text-sm text-ink-soft m-0 mb-6 leading-[1.55]">
        Ingresa el código de <span className="oldstyle">6</span> dígitos que muestra tu app ahora mismo.
      </p>

      <OTPInput value={code} onChange={onChange} onComplete={onContinue} />

      <div className="flex justify-between items-center mt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-2 h-10"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={code.length < 6}
          className="inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </>
  );
}

function Step3({
  onBack,
  onFinish,
  onCopyAll,
  onDownload,
  copied,
}: {
  onBack: () => void;
  onFinish: () => void;
  onCopyAll: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  return (
    <>
      <h2 className="font-serif italic font-medium text-[24px] text-ink m-0 mb-2.5 tracking-[-0.02em]" id="twofa-title">
        Tus códigos de respaldo
      </h2>
      <p className="text-sm text-ink-soft m-0 mb-5 leading-[1.55]">
        Si pierdes acceso a tu app, estos códigos te dejan entrar. Cada uno funciona una sola vez.
      </p>

      <div
        role="alert"
        className="flex gap-2.5 px-4 py-3 rounded-[10px] mb-5 text-sm leading-[1.45] text-ink"
        style={{
          background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
          borderLeft: "3px solid var(--color-gold)",
        }}
      >
        <svg
          className="w-4 h-4 text-gold-dark shrink-0 mt-[2px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx={12} cy={12} r={10} />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <span>
          Guarda estos códigos en un lugar seguro.{" "}
          <strong className="font-medium">No se mostrarán de nuevo.</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-5 bg-linen rounded-2xl p-5 font-mono text-[13px] text-ink tracking-[0.05em]">
        {DEMO_BACKUP_CODES.map((c, i) => (
          <span
            key={c}
            className="flex items-baseline gap-2 px-1.5 py-1"
          >
            <span className="text-ink-muted text-[10px] oldstyle w-4">{i + 1}.</span>
            {c}
          </span>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-1">
        <button
          type="button"
          onClick={onCopyAll}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-cream text-ink-soft border border-rule text-[13px] font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          <IconCopy className="w-3.5 h-3.5" />
          {copied ? "Copiados" : "Copiar todos"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-cream text-ink-soft border border-rule text-[13px] font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v12" />
            <path d="m7 11 5 5 5-5" />
            <path d="M5 20h14" />
          </svg>
          Descargar .txt
        </button>
      </div>

      <div className="flex justify-between items-center mt-7">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-2 h-10"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors"
        >
          Terminar
        </button>
      </div>
    </>
  );
}

/** Visual decorative QR — not a scannable code. */
function FakeQR() {
  return (
    <div className="w-[220px] h-[220px] bg-paper p-3.5 rounded-[12px] border border-rule">
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden>
        <rect width={200} height={200} fill="white" />
        <g fill="#1F1B16">
          {/* finder patterns */}
          <rect x={8} y={8} width={50} height={50} />
          <rect x={14} y={14} width={38} height={38} fill="white" />
          <rect x={22} y={22} width={22} height={22} />
          <rect x={142} y={8} width={50} height={50} />
          <rect x={148} y={14} width={38} height={38} fill="white" />
          <rect x={156} y={22} width={22} height={22} />
          <rect x={8} y={142} width={50} height={50} />
          <rect x={14} y={148} width={38} height={38} fill="white" />
          <rect x={22} y={156} width={22} height={22} />
        </g>
        {/* pseudo-random data modules */}
        <g fill="#1F1B16">
          {[
            [70, 10], [86, 10], [110, 10], [126, 10],
            [70, 26], [94, 26], [118, 26],
            [78, 42], [102, 42], [118, 42], [134, 42],
            [10, 70], [42, 70], [78, 70], [110, 70], [158, 70], [190, 70],
            [18, 86], [66, 86], [118, 86], [166, 86],
            [10, 102], [58, 102], [98, 102], [126, 102], [174, 102],
            [26, 118], [82, 118], [130, 118], [158, 118], [190, 118],
            [14, 134], [70, 134], [94, 134], [142, 134], [174, 134],
            [70, 158], [94, 158], [142, 158], [182, 158],
            [78, 174], [134, 174], [174, 174],
            [70, 190], [118, 190], [158, 190],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={8} height={8} />
          ))}
        </g>
      </svg>
    </div>
  );
}
