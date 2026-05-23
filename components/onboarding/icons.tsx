import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  ...p,
});

export const IconHouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
  </svg>
);

export const IconBuildings = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={4} width={7} height={16} rx={1} />
    <rect x={13} y={9} width={7} height={11} rx={1} />
    <path d="M6 8h3M6 12h3M6 16h3M15 12h3M15 16h3" />
  </svg>
);

export const IconTents = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 21h20" />
    <path d="M5 21 12 5l7 16" />
    <path d="M8 21V13l4-3 4 3v8" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M5 12h14" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
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

export const FlagCO = (p: P) => (
  <svg width={18} height={13} viewBox="0 0 18 13" aria-hidden {...p}>
    <rect width={18} height={13} fill="#FCD116" />
    <rect width={18} height={6.5} y={6.5} fill="#003893" />
    <rect width={18} height={3.25} y={9.75} fill="#CE1126" />
  </svg>
);

export const HeroCurve = (p: P) => (
  <svg viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden {...p}>
    <path d="M 2 20 C 12 8, 28 28, 40 14 S 56 16, 58 10" />
  </svg>
);

export const HeroCurveLarge = (p: P) => (
  <svg viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden {...p}>
    <path d="M 8 40 C 30 12, 60 56, 100 28 S 170 22, 192 20" />
  </svg>
);
