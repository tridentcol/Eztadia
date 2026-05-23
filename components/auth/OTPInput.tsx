"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
}: {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (full: string) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setCharAt(i: number, ch: string) {
    const next = value.split("");
    next[i] = ch;
    while (next.length < length) next.push("");
    const out = next.slice(0, length).join("");
    onChange(out);
    if (ch && i < length - 1) {
      refs.current[i + 1]?.focus();
      setActive(i + 1);
    }
    if (out.length === length && !out.includes("") && onComplete) {
      onComplete(out);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace") {
      if (value[i]) {
        setCharAt(i, "");
        return;
      }
      if (i > 0) {
        refs.current[i - 1]?.focus();
        setActive(i - 1);
        setCharAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
      setActive(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
      setActive(i + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>, i: number) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length - i);
    if (!text) return;
    e.preventDefault();
    const next = value.split("");
    for (let k = 0; k < text.length; k++) next[i + k] = text[k];
    while (next.length < length) next.push("");
    const out = next.slice(0, length).join("");
    onChange(out);
    const last = Math.min(length - 1, i + text.length);
    refs.current[last]?.focus();
    setActive(last);
    if (out.length === length && !out.includes("") && onComplete) onComplete(out);
  }

  return (
    <div className="grid grid-cols-6 gap-2 mb-7">
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? "";
        const filled = !!ch;
        const isActive = active === i;
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={ch}
            onFocus={() => setActive(i)}
            onChange={(e) => {
              const c = e.target.value.replace(/\D/g, "").slice(-1);
              if (c !== "") setCharAt(i, c);
            }}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            aria-label={`Dígito ${i + 1}`}
            className={[
              "w-full h-14 rounded-[10px] bg-paper text-center outline-0",
              "font-serif font-medium text-[28px] text-ink",
              "transition-[border-color,box-shadow] duration-200 ease-organic",
              isActive
                ? "border border-sage shadow-[0_0_0_3px_var(--color-sage-tint)]"
                : filled
                  ? "border border-rule"
                  : "border border-rule-strong",
            ].join(" ")}
            style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
          />
        );
      })}
    </div>
  );
}
