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

export const IconHouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
  </svg>
);
export const IconIdentity = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={4} width={16} height={16} rx={2} />
    <circle cx={9} cy={9} r={2} />
    <path d="M4 17l5-5 5 5" />
    <path d="M12 14l3-3 5 5" />
  </svg>
);
export const IconPhotos = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={4} width={18} height={16} rx={2} />
    <circle cx={9} cy={10} r={2} />
    <path d="m3 18 6-6 4 4 4-4 4 4" />
  </svg>
);
export const IconAmenities = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" />
    <path d="M17 11h2a2 2 0 0 1 0 4h-2" />
    <path d="M8 4c0 1 1 1 1 2s-1 1-1 2" />
    <path d="M12 4c0 1 1 1 1 2s-1 1-1 2" />
  </svg>
);
export const IconPolicies = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 3h13v4a4 4 0 0 1-4 4H8z" />
    <path d="M3 13v6a2 2 0 0 0 2 2h11" />
    <path d="M3 17h10" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);
export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={3} />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.66-.27 1.06-.91 1-1.6V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.27.66.91 1.06 1.6 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
export const IconHelpCircle = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <circle cx={12} cy={12} r={9} />
    <path d="M9.5 9a3 3 0 0 1 5.5 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
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
export const IconChevronDown = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconCheckRing = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={9} />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const IconLockRing = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={11} width={16} height={10} rx={2} />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const IconCheckArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
