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

export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 2h16v20l-4-2-4 2-4-2-4 2z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
);

export const IconDollar = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2v20" />
    <path d="M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7" />
  </svg>
);

export const IconDoor = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v18h12V4a2 2 0 0 0-2-2z" />
    <path d="M14 22h6V8h-6" />
    <circle cx={11} cy={12} r={1} fill="currentColor" />
  </svg>
);

export const IconHouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={8} r={4} />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </svg>
);

export const IconKey = (p: P) => (
  <svg {...base(p)}>
    <circle cx={8} cy={15} r={4} />
    <path d="M10.85 12.15 21 2M19 5l3 3M16 8l3 3" />
  </svg>
);

export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
);

export const IconTag = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx={7} cy={7} r={1.5} />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx={12} cy={12} r={10} />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const IconActivity = (p: P) => (
  <svg {...base(p)}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
