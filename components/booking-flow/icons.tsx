import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  ...p,
});

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={11} width={16} height={10} rx={2} />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconUploadSimple = (p: P) => (
  <svg {...base(p)} strokeWidth={1.4}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={13} r={8} />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M9 3h6" />
  </svg>
);

export const IconCalendarPlus = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={16} rx={2} />
    <path d="M3 9h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M12 13v4" />
    <path d="M10 15h4" />
  </svg>
);

export const IconMapPinSm = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
    <circle cx={12} cy={10} r={3} />
  </svg>
);

export const IconCheckSimple = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);

export const IconFileText = (p: P) => (
  <svg {...base(p)} strokeWidth={1.3}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x={8} y={8} width={13} height={13} rx={2} />
    <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
  </svg>
);

export const IconChevronLeft = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconChevronDown = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

/** Colombian tricolor flag (16×11). */
export const FlagCO = (p: P) => (
  <svg width={18} height={13} viewBox="0 0 18 13" aria-hidden {...p}>
    <rect width={18} height={13} fill="#FCD116" />
    <rect width={18} height={6.5} y={6.5} fill="#003893" />
    <rect width={18} height={3.25} y={9.75} fill="#CE1126" />
  </svg>
);

/** Inline PSE wordmark badge — small flag tile (white-on-blue) and "PSE" letters. */
export function PSEBadge({
  variant = "color",
  className,
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  if (variant === "white") {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.16)",
          font: "700 13px Inter",
          letterSpacing: "0.04em",
          color: "var(--color-cream)",
        }}
      >
        PSE
      </span>
    );
  }
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 6,
        background: "linear-gradient(135deg, #1B6FB7 0%, #0F4F8F 100%)",
        color: "white",
        font: "700 13px Inter",
        letterSpacing: "0.04em",
      }}
    >
      PSE
    </span>
  );
}
