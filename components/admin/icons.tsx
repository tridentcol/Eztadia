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

export const IconChartLine = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 4 4 5-7" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx={9} cy={8} r={3.5} />
    <path d="M2 21a7 7 0 0 1 14 0" />
    <circle cx={17} cy={9} r={2.5} />
    <path d="M22 17a4 4 0 0 0-6-3.5" />
  </svg>
);
export const IconHouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
  </svg>
);
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);
export const IconClipboard = (p: P) => (
  <svg {...base(p)}>
    <rect x={5} y={3} width={14} height={18} rx={2} />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const IconChatCircle = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.4-.4 2.8-1 4l1 4-4-1c-1.2.6-2.6 1-4 1-4.4 0-8-3.6-8-8z" />
  </svg>
);
export const IconLightning = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-2 8 9-12h-7z" />
  </svg>
);
export const IconBug = (p: P) => (
  <svg {...base(p)}>
    <rect x={5} y={6} width={14} height={14} rx={4} />
    <path d="M9 4l-2 2M15 4l2 2M3 12h2M19 12h2" />
    <path d="M9 14h.01M15 14h.01" />
  </svg>
);
export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={3} />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.66-.27 1.06-.91 1-1.6V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.27.66.91 1.06 1.6 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
export const IconArrowLeft = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
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
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx={11} cy={11} r={7} />
    <path d="m20 20-4-4" />
  </svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5L6 17z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);
