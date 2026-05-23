"use client";

import { useEffect, useState, type ReactNode } from "react";

export type ConfirmTone = "warning" | "destructive";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (extra?: { reason?: string }) => void | Promise<void>;
  tone?: ConfirmTone;
  title: ReactNode;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** If set, requires the user to type this token to enable confirm (e.g. "ELIMINAR"). */
  typeToConfirm?: string;
  /** Optional reason textarea, visible to recipient. */
  reasonField?: { placeholder: string };
  /** Inline icon SVG (24x24). Defaults to warning triangle. */
  icon?: ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  tone = "warning",
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancelar",
  typeToConfirm,
  reasonField,
  icon,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setTyped("");
      setReason("");
      setBusy(false);
    }
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

  const canConfirm =
    !typeToConfirm || typed.toUpperCase() === typeToConfirm.toUpperCase();

  async function handleConfirm() {
    if (!canConfirm || busy) return;
    setBusy(true);
    try {
      await onConfirm(reasonField ? { reason } : undefined);
    } finally {
      setBusy(false);
    }
  }

  const ornCls =
    tone === "destructive"
      ? "bg-[rgba(199,111,76,0.12)] text-clay"
      : "bg-[rgba(196,154,60,0.14)] text-warning";

  const confirmCls =
    "h-10 px-[18px] rounded-xl bg-danger text-cream text-sm font-medium hover:bg-[#8E3C32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8 overflow-y-auto"
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <div
        className="relative z-[101] w-full max-w-[460px] bg-paper rounded-[28px] p-9"
        style={{ boxShadow: "var(--shadow-modal, var(--shadow-pop))" }}
      >
        <span
          aria-hidden
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 ${ornCls}`}
        >
          {icon ?? <WarningIcon />}
        </span>
        <h3
          id="confirm-title"
          className="font-serif italic font-medium text-[24px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.15]"
        >
          {title}
        </h3>
        <p className="text-sm text-ink-soft m-0 mb-5 leading-[1.55]">{body}</p>

        {reasonField && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonField.placeholder}
            rows={3}
            className="w-full min-h-[80px] bg-paper border border-rule-strong rounded-[10px] px-3.5 py-2.5 text-sm text-ink outline-0 placeholder:text-ink-muted leading-[1.5] resize-y mb-5 transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
          />
        )}

        {typeToConfirm && (
          <>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())}
              placeholder={typeToConfirm}
              autoFocus
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[15px] text-ink outline-0 font-mono tracking-[0.08em] mb-2 transition-[border-color,box-shadow] focus:border-danger focus:shadow-[0_0_0_3px_rgba(168,72,60,0.18)]"
            />
            <p className="text-[12px] text-ink-muted m-0 mb-5">
              Escribe <strong className="text-ink">{typeToConfirm}</strong> exactamente para confirmar.
            </p>
          </>
        )}

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
            className={confirmCls}
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3 4 7v6c0 4.5 3 8 8 9 5-1 8-4.5 8-9V7z" />
      <path d="M12 8v4" />
      <path d="M12 15h.01" />
    </svg>
  );
}
