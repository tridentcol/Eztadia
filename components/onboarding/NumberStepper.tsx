"use client";

import { IconMinus, IconPlus } from "./icons";

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = "md",
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "md" | "lg";
  ariaLabel?: string;
}) {
  const isLg = size === "lg";
  return (
    <div
      className={[
        "inline-flex items-center gap-3 bg-paper border border-rule-strong rounded-[10px] p-1",
        isLg ? "h-14" : "h-12",
      ].join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Disminuir"
        className={[
          "rounded-lg bg-cream text-ink inline-flex items-center justify-center transition-colors hover:bg-linen disabled:opacity-35 disabled:cursor-not-allowed",
          isLg ? "w-10 h-10" : "w-9 h-9",
        ].join(" ")}
      >
        <IconMinus className={isLg ? "w-4 h-4" : "w-3.5 h-3.5"} />
      </button>
      <span
        className={[
          "font-serif font-medium text-center text-ink",
          isLg ? "text-2xl min-w-[44px]" : "text-lg min-w-[32px]",
        ].join(" ")}
        style={{
          fontVariantNumeric: "oldstyle-nums tabular-nums",
          fontFeatureSettings: '"onum","tnum"',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar"
        className={[
          "rounded-lg bg-cream text-ink inline-flex items-center justify-center transition-colors hover:bg-linen disabled:opacity-35 disabled:cursor-not-allowed",
          isLg ? "w-10 h-10" : "w-9 h-9",
        ].join(" ")}
      >
        <IconPlus className={isLg ? "w-4 h-4" : "w-3.5 h-3.5"} />
      </button>
    </div>
  );
}
