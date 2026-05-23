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

export const IconMailInvite = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconDotsThree = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <circle cx={5} cy={12} r={1.6} />
    <circle cx={12} cy={12} r={1.6} />
    <circle cx={19} cy={12} r={1.6} />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
