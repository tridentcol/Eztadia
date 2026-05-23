import type { ReactNode } from "react";

export function InlineFieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-ink leading-[1.45]">
      <svg
        className="w-[13px] h-[13px] text-danger shrink-0 mt-[2px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx={12} cy={12} r={9} />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
