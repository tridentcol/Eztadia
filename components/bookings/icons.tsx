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

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const IconDotsThree = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <circle cx={5} cy={12} r={1.6} />
    <circle cx={12} cy={12} r={1.6} />
    <circle cx={19} cy={12} r={1.6} />
  </svg>
);

export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="m7 17 10-10" />
    <path d="M8 7h9v9" />
  </svg>
);

export const IconArrowDownLeft = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="m17 7-10 10" />
    <path d="M16 17H7V8" />
  </svg>
);

export const IconFileText = (p: P) => (
  <svg {...base(p)} strokeWidth={1.3}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export const IconSortBoth = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="m6 9 6-6 6 6" />
    <path d="m6 15 6 6 6-6" />
  </svg>
);

export const IconSortAsc = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="m6 9 6-6 6 6" />
  </svg>
);

export const IconSortDesc = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="m6 15 6 6 6-6" />
  </svg>
);

export const IconHand = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 11V5a1.5 1.5 0 0 1 3 0v6" />
    <path d="M12 11V4a1.5 1.5 0 0 1 3 0v8" />
    <path d="M15 12V6a1.5 1.5 0 0 1 3 0v10a5 5 0 0 1-10 0v-5a1.5 1.5 0 0 1 3 0v3" />
  </svg>
);

/** Colombia flag — yellow / blue / red bands. */
export const FlagCO = (p: P) => (
  <svg width={16} height={11} viewBox="0 0 16 11" aria-hidden {...p}>
    <rect width={16} height={11} fill="#FCD116" />
    <rect width={16} height={5.5} y={5.5} fill="#003893" />
    <rect width={16} height={2.75} y={8.25} fill="#CE1126" />
  </svg>
);

/** Generic flag fallback. */
export const FlagGeneric = (p: P) => (
  <svg width={16} height={11} viewBox="0 0 16 11" aria-hidden {...p}>
    <rect width={16} height={11} fill="#E5DFD3" />
    <path d="M0 0h16v3H0z" fill="#D4CCB9" />
  </svg>
);
