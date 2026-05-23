"use client";

import { useEffect, useState, type ReactNode } from "react";

export type ErrorToastProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  onRetry?: () => void;
  onClose: () => void;
};

export function ErrorToast({
  open,
  title,
  description,
  onRetry,
  onClose,
}: ErrorToastProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "fixed bottom-5 right-5 z-[200] w-[360px] max-w-[calc(100vw-24px)]",
        "bg-paper rounded-2xl px-5 py-4 flex items-start gap-3",
        "transition-[opacity,transform] duration-300 ease-organic",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{
        borderLeft: "3px solid var(--color-danger)",
        boxShadow: "var(--shadow-pop, var(--shadow-soft))",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-serif italic font-medium text-[15px] text-ink m-0 mb-1 tracking-[-0.005em]">
          {title}
        </p>
        {description && (
          <p className="text-[13px] text-ink-soft m-0 mb-2.5 leading-[1.45]">{description}</p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center h-[30px] px-2.5 rounded-lg bg-cream text-ink-soft border border-rule text-[12px] font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="w-[26px] h-[26px] rounded-md text-ink-muted hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors -mt-0.5"
      >
        <svg
          width={13}
          height={13}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12" />
          <path d="M18 6l-12 12" />
        </svg>
      </button>
    </div>
  );
}
