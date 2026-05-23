"use client";

import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import { DotsLoader } from "./DotsLoader";

type Variant = "sage" | "terracotta" | "destructive" | "outline-sage";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
  successLabel?: string;
  showSuccess?: boolean;
  onClick?: () => void | Promise<void>;
  children: React.ReactNode;
};

const baseCls =
  "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl text-sm font-medium transition-[background-color,color,border-color,transform] duration-200 ease-organic active:scale-[0.99] disabled:cursor-not-allowed";

const VARIANT: Record<Variant, string> = {
  sage: "bg-sage text-cream hover:bg-[#4F6759] disabled:opacity-80",
  terracotta: "bg-terracotta text-cream hover:bg-clay disabled:opacity-80",
  destructive: "bg-danger text-cream hover:bg-[#8E3C32] disabled:opacity-80",
  "outline-sage":
    "bg-transparent text-sage border border-sage hover:bg-sage-tint disabled:opacity-60",
};

const SUCCESS_BG: Record<Variant, string> = {
  sage: "bg-success text-cream",
  terracotta: "bg-success text-cream",
  destructive: "bg-success text-cream",
  "outline-sage": "bg-success text-cream border border-success",
};

export function LoadingButton({
  variant = "sage",
  loading = false,
  loadingLabel,
  successLabel,
  showSuccess = false,
  onClick,
  children,
  className = "",
  ...rest
}: Props) {
  const [internalSuccess, setInternalSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      setInternalSuccess(true);
      const t = window.setTimeout(() => setInternalSuccess(false), 1500);
      return () => window.clearTimeout(t);
    }
  }, [showSuccess]);

  const isLoading = loading;
  const isSuccess = internalSuccess;
  const isDisabled = isLoading || isSuccess || rest.disabled;

  return (
    <button
      type="button"
      {...rest}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        baseCls,
        isSuccess ? SUCCESS_BG[variant] : VARIANT[variant],
        className,
      ].join(" ")}
    >
      {isLoading ? (
        <>
          <DotsLoader />
          {loadingLabel ?? "Cargando…"}
        </>
      ) : isSuccess ? (
        <>
          <CheckIcon />
          {successLabel ?? "Guardado"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
