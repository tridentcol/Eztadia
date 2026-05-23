"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { Orn404, OrnCurveBroken, OrnKeyOrganic } from "./Ornaments";

export type ErrorVariant = "404" | "500" | "403";

export type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "outline-sage" | "sage" | "ghost";
};

export function ErrorState({
  variant,
  title,
  body,
  actions = [],
  errorCode,
  errorAt,
}: {
  variant: ErrorVariant;
  title: string;
  body: ReactNode;
  actions?: ErrorAction[];
  errorCode?: string;
  errorAt?: string;
}) {
  return (
    <div className="max-w-[480px] mx-auto text-center py-24 px-6">
      <Ornament variant={variant} />
      <h1 className="font-serif italic font-medium text-[32px] text-ink m-0 mb-3.5 tracking-[-0.025em] leading-[1.1]">
        {title}
      </h1>
      <p className="text-base text-ink-soft leading-[1.55] m-0 mb-7 max-w-[44ch] mx-auto">
        {body}
      </p>
      {actions.length > 0 && (
        <div className="inline-flex gap-2 flex-wrap justify-center">
          {actions.map((a, i) => (
            <ActionBtn key={i} action={a} />
          ))}
        </div>
      )}
      {(errorCode || errorAt) && (
        <ErrorCodeFooter code={errorCode} at={errorAt} />
      )}
    </div>
  );
}

function Ornament({ variant }: { variant: ErrorVariant }) {
  if (variant === "404") {
    return <Orn404 className="mb-6 inline-block" />;
  }
  if (variant === "403") {
    return <OrnKeyOrganic className="mx-auto mb-6 text-gold opacity-65" />;
  }
  return <OrnCurveBroken className="mx-auto mb-6 text-clay opacity-60" />;
}

function ActionBtn({ action }: { action: ErrorAction }) {
  const cls = {
    "outline-sage":
      "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint transition-colors",
    sage:
      "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors",
    ghost:
      "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors",
  }[action.variant ?? "outline-sage"];

  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}

function ErrorCodeFooter({ code, at }: { code?: string; at?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${code ?? ""} · ${at ?? ""}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }
  return (
    <div
      className="mt-7 pt-4 border-t border-rule inline-flex items-center gap-2 font-mono text-xs text-ink-muted"
      style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
    >
      {code && <span>Código: {code}</span>}
      {code && at && <span aria-hidden>·</span>}
      {at && <span>Hora: {at}</span>}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar código de error"
        className="w-6 h-6 rounded-md text-ink-muted hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x={8} y={8} width={13} height={13} rx={2} />
          <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
        </svg>
      </button>
      {copied && <span className="text-sage">Copiado</span>}
    </div>
  );
}
