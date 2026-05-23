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

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x={3} y={5} width={18} height={14} rx={2} />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x={4} y={11} width={16} height={10} rx={2} />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={8} r={4} />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);

export const IconEyeSlash = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3 3.6" />
    <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 5-1.3" />
    <path d="M9.5 9.5a3.5 3.5 0 0 0 5 5" />
  </svg>
);

export const IconPaperPlane = (p: P) => (
  <svg {...base(p)}>
    <path d="m22 2-11 11" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </svg>
);

export const IconWarningCircle = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <circle cx={12} cy={12} r={10} />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={13} r={8} />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M9 3h6" />
  </svg>
);

export const IconChevronLeft = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconChevronDown = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const FlagCO = (p: P) => (
  <svg width={18} height={13} viewBox="0 0 18 13" aria-hidden {...p}>
    <rect width={18} height={13} fill="#FCD116" />
    <rect width={18} height={6.5} y={6.5} fill="#003893" />
    <rect width={18} height={3.25} y={9.75} fill="#CE1126" />
  </svg>
);
