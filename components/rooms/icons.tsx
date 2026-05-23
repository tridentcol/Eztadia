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

export const IconBed = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 17V8" />
    <path d="M2 14h20v6" />
    <path d="M22 14V9a2 2 0 0 0-2-2H10v7" />
    <circle cx={6.5} cy={11.5} r={1.5} />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconArchive = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={4} width={18} height={4} rx={1} />
    <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 13h4" />
  </svg>
);

export const IconUnarchive = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={4} width={18} height={4} rx={1} />
    <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M12 11v6" />
    <path d="m9 14 3-3 3 3" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx={9} cy={7} r={4} />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconRuler = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 2 22 8 8 22 2 16z" />
    <path d="M7.5 10.5 9 12" />
    <path d="M10.5 7.5 12 9" />
    <path d="M13.5 4.5 15 6" />
    <path d="M4.5 13.5 6 15" />
  </svg>
);
