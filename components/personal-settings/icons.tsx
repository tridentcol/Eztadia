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

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={8} r={4} />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 4 7v6c0 4.5 3 8 8 9 5-1 8-4.5 8-9V7z" />
  </svg>
);
export const IconShieldWarning = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 4 7v6c0 4.5 3 8 8 9 5-1 8-4.5 8-9V7z" />
    <path d="M12 8v4" />
    <path d="M12 15h.01" />
  </svg>
);
export const IconDesktop = (p: P) => (
  <svg {...base(p)} strokeWidth={1.4}>
    <rect x={3} y={5} width={14} height={10} rx={1.5} />
    <path d="M3 18h14" />
    <rect x={16} y={11} width={5} height={9} rx={1} />
  </svg>
);
export const IconMobile = (p: P) => (
  <svg {...base(p)} strokeWidth={1.4}>
    <rect x={6} y={2} width={12} height={20} rx={2.5} />
    <path d="M11 18h2" />
  </svg>
);
export const IconBrowsers = (p: P) => (
  <svg {...base(p)} strokeWidth={1.4}>
    <rect x={3} y={5} width={18} height={13} rx={1.5} />
    <path d="M3 9h18" />
    <circle cx={7} cy={7} r={0.5} fill="currentColor" />
    <circle cx={9.5} cy={7} r={0.5} fill="currentColor" />
  </svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5L6 17z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={9} />
    <path d="M3 12h18" />
    <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
  </svg>
);
export const IconCreditCard = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={6} width={18} height={13} rx={2} />
    <path d="M3 10h18" />
  </svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const IconWhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01A9.83 9.83 0 0 0 12.04 2zm5.78 14.13c-.24.67-1.41 1.28-1.95 1.36-.5.07-1.13.1-1.83-.11-.42-.13-.96-.31-1.66-.61-2.91-1.26-4.81-4.19-4.95-4.38-.15-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36s.39 0 .56.01c.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.38-.41.51-.14.14-.28.29-.12.57.16.29.71 1.17 1.52 1.89 1.04.93 1.92 1.21 2.21 1.36.29.14.46.12.63-.07.17-.19.73-.85.93-1.14.19-.29.38-.24.65-.14.27.1 1.71.81 2 .96.29.15.49.22.56.34.07.13.07.74-.17 1.41z" />
  </svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x={8} y={8} width={13} height={13} rx={2} />
    <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
  </svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);
export const IconHelpCircle = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <circle cx={12} cy={12} r={9} />
    <path d="M9.5 9a3 3 0 0 1 5.5 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);
export const IconLockOpen = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={11} width={16} height={10} rx={2} />
    <path d="M8 11v-3a4 4 0 0 1 8 0" />
  </svg>
);

export const FlagCO = (p: P) => (
  <svg width={18} height={13} viewBox="0 0 18 13" aria-hidden {...p}>
    <rect width={18} height={13} fill="#FCD116" />
    <rect width={18} height={6.5} y={6.5} fill="#003893" />
    <rect width={18} height={3.25} y={9.75} fill="#CE1126" />
  </svg>
);

export const FlagUS = (p: P) => (
  <svg width={18} height={13} viewBox="0 0 18 13" aria-hidden {...p}>
    <rect width={18} height={13} fill="#B22234" />
    {[1, 3, 5, 7, 9, 11].map((y) => (
      <rect key={y} y={y} width={18} height={1} fill="#FFFFFF" />
    ))}
    <rect width={9} height={7} fill="#3C3B6E" />
  </svg>
);

export const HeroCurve = (p: P) => (
  <svg viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden {...p}>
    <path d="M 8 40 C 30 12, 60 56, 100 28 S 170 22, 192 20" />
  </svg>
);
