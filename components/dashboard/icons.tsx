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
export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={16} rx={2} />
    <path d="M3 9h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </svg>
);
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h5" />
  </svg>
);
export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.4-.4 2.8-1 4l1 4-4-1c-1.2.6-2.6 1-4 1-4.4 0-8-3.6-8-8z" />
  </svg>
);
export const IconDoor = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h12v18H6z" />
    <path d="M9 21V3" />
    <circle cx={13} cy={12} r={1} fill="currentColor" />
  </svg>
);
export const IconDollar = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v10" />
    <path d="M15 9.5c-.5-1.2-1.7-2-3.2-2-1.8 0-3.3 1-3.3 2.5s1.5 2 3.3 2.3c1.7.4 3.2.8 3.2 2.5 0 1.5-1.5 2.5-3.3 2.5-1.6 0-2.8-.8-3.3-2.2" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx={9.5} cy={7.5} r={3.5} />
    <path d="M21 20v-2a4 4 0 0 0-3-3.85" />
    <path d="M16 4.15A4 4 0 0 1 16 11" />
  </svg>
);
export const IconPuzzle = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3H7a1 1 0 0 0-1 1v3h3a2 2 0 1 1 0 4H6v3a1 1 0 0 0 1 1h4v-3a2 2 0 1 1 4 0v3h4a1 1 0 0 0 1-1v-4h-3a2 2 0 1 1 0-4h3V8a1 1 0 0 0-1-1z" />
  </svg>
);
export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5L6 17z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx={11} cy={11} r={7} />
    <path d="m20 20-4-4" />
  </svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);
export const IconWhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01A9.83 9.83 0 0 0 12.04 2zm5.78 14.13c-.24.67-1.41 1.28-1.95 1.36-.5.07-1.13.1-1.83-.11-.42-.13-.96-.31-1.66-.61-2.91-1.26-4.81-4.19-4.95-4.38-.15-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36s.39 0 .56.01c.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.38-.41.51-.14.14-.28.29-.12.57.16.29.71 1.17 1.52 1.89 1.04.93 1.92 1.21 2.21 1.36.29.14.46.12.63-.07.17-.19.73-.85.93-1.14.19-.29.38-.24.65-.14.27.1 1.71.81 2 .96.29.15.49.22.56.34.07.13.07.74-.17 1.41z" />
  </svg>
);
export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
    <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
  </svg>
);
export const IconHelp = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={10} />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={8} r={4} />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M14 4h7v7" />
  </svg>
);
