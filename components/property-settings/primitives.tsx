"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { IconMinus, IconPlus } from "./icons";

/* ─── FieldShell ─── */
export function FieldShell({
  label,
  error,
  helper,
  children,
  className = "",
}: {
  label?: string;
  error?: string;
  helper?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2">
          {label}
        </span>
      )}
      {children}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {!error && helper && (
        <p className="mt-2 text-xs text-ink-muted leading-[1.55]">{helper}</p>
      )}
    </div>
  );
}

/* ─── Input ─── */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        {...rest}
        className={[
          "w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[15px] text-ink outline-0 placeholder:text-ink-muted",
          "transition-[border-color,box-shadow] duration-200 ease-organic",
          "focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]",
          className,
        ].join(" ")}
      />
    );
  },
);

/* ─── Textarea ─── */
export function Textarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={[
        "w-full min-h-[96px] bg-paper border border-rule-strong rounded-[10px] px-3.5 py-3 text-[15px] text-ink outline-0 placeholder:text-ink-muted leading-[1.5] resize-y",
        "transition-[border-color,box-shadow] duration-200 ease-organic",
        "focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]",
        className,
      ].join(" ")}
    />
  );
}

/* ─── Select ─── */
export function Select({
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={[
          "w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 pr-10 text-[15px] text-ink outline-0 appearance-none cursor-pointer",
          "transition-[border-color,box-shadow] duration-200 ease-organic",
          "focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]",
          className,
        ].join(" ")}
      >
        {children}
      </select>
      <svg
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ─── ToggleSwitch ─── */
export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200",
        checked ? "bg-sage" : "bg-rule-strong",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-paper transition-transform duration-200",
          "shadow-[0_1px_2px_rgba(31,27,22,0.12)]",
          checked ? "translate-x-[18px]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

/* ─── ToggleRow ─── */
export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  right,
}: {
  title: string;
  description?: ReactNode;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 py-3.5 border-t border-rule first:border-t-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink m-0 mb-0.5">{title}</p>
        {description && (
          <p className="text-[12.5px] text-ink-muted m-0 leading-[1.45]">{description}</p>
        )}
      </div>
      {right ?? (
        checked !== undefined && onChange ? (
          <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={title} />
        ) : null
      )}
    </div>
  );
}

/* ─── ToggleChip (Amenities) ─── */
export function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13.5px] font-medium transition-all duration-150 border w-full justify-start",
        active
          ? "border-sage bg-sage-tint text-sage"
          : "border-rule bg-paper text-ink-soft hover:border-rule-strong",
      ].join(" ")}
    >
      <span className="w-[14px] h-[14px] inline-flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* ─── NumberStepper ─── */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-2.5 bg-paper border border-rule-strong rounded-[10px] p-1 h-11"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Disminuir"
        className="w-8 h-8 rounded-lg bg-cream text-ink inline-flex items-center justify-center transition-colors hover:bg-linen disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <IconMinus className="w-3.5 h-3.5" />
      </button>
      <span
        className="font-serif font-medium text-base text-ink text-center min-w-[44px]"
        style={{
          fontVariantNumeric: "oldstyle-nums tabular-nums",
          fontFeatureSettings: '"onum","tnum"',
        }}
      >
        {value}
        {suffix && <span className="text-ink-soft ml-0.5">{suffix}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar"
        className="w-8 h-8 rounded-lg bg-cream text-ink inline-flex items-center justify-center transition-colors hover:bg-linen disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <IconPlus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── SectionHeader ─── */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-8">
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
        {eyebrow}
      </span>
      <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
        {title}
      </h1>
      <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">{subtitle}</p>
    </header>
  );
}

/* ─── Divider ─── */
export function Divider({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-px bg-rule my-8 ${className}`} />;
}
