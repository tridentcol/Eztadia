"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { IconEye, IconEyeSlash } from "./icons";

const inputBase =
  "w-full h-12 rounded-[10px] border bg-paper text-[15px] text-ink outline-0 placeholder:text-ink-muted transition-[border-color,box-shadow] duration-200 ease-organic " +
  "focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]";

export type FieldShellProps = {
  label: string;
  helper?: React.ReactNode;
  error?: string;
  trailing?: React.ReactNode; // label-row right side (e.g. "¿Olvidaste...?")
  children: React.ReactNode;
};

export function FieldShell({ label, helper, error, trailing, children }: FieldShellProps) {
  return (
    <div className="mb-[18px]">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
          {label}
        </span>
        {trailing}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {!error && helper && <div className="mt-2">{helper}</div>}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  iconLeft?: React.ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { iconLeft, className = "", ...rest },
  ref,
) {
  return (
    <div className="relative">
      {iconLeft && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted">
          {iconLeft}
        </span>
      )}
      <input
        ref={ref}
        {...rest}
        className={[inputBase, "border-rule-strong", iconLeft ? "pl-[42px] pr-3.5" : "px-3.5", className].join(" ")}
      />
    </div>
  );
});

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ className = "", ...rest }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted">
          <LockSmall />
        </span>
        <input
          ref={ref}
          {...rest}
          type={show ? "text" : "password"}
          className={[inputBase, "border-rule-strong", "pl-[42px] pr-12", className].join(" ")}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-lg inline-flex items-center justify-center text-ink-muted hover:bg-linen hover:text-ink transition-colors"
        >
          {show ? <IconEyeSlash className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
        </button>
      </div>
    );
  },
);

function LockSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x={4} y={11} width={16} height={10} rx={2} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Standalone checkbox primitive — controlled. */
export function Checkbox({
  checked,
  onChange,
  children,
  invalid = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-invalid={invalid}
      />
      <span
        aria-hidden
        className={[
          "w-[18px] h-[18px] flex-shrink-0 rounded-[5px] mt-[1px] inline-flex items-center justify-center transition-colors",
          checked ? "bg-sage border border-sage" : "bg-paper border-[1.5px] border-rule-strong",
          invalid && !checked ? "border-danger" : "",
        ].join(" ")}
      >
        {checked && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px] text-cream">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span className="text-[13px] text-ink leading-[1.45]">{children}</span>
    </label>
  );
}
