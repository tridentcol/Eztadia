import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const wrap = (p: P, w = 120, h = 80) => ({
  width: w,
  height: h,
  viewBox: `0 0 ${w} ${h}`,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  ...p,
});

/** Curva sinusoidal + 3 puntos al final — calendario vacío / sin reservas. */
export const OrnCalendarEmpty = (p: P) => (
  <svg {...wrap(p, 120, 60)}>
    <path d="M 8 36 C 30 12, 56 52, 78 28" />
    <circle cx={86} cy={28} r={2.5} fill="currentColor" stroke="none" />
    <circle cx={96} cy={28} r={2.5} fill="currentColor" stroke="none" />
    <circle cx={106} cy={28} r={2.5} fill="currentColor" stroke="none" />
  </svg>
);

/** Silueta de casa con techo curvo. */
export const OrnHouseOrganic = (p: P) => (
  <svg {...wrap(p, 120, 84)}>
    <path d="M 18 70 C 18 52, 28 30, 60 14 C 92 30, 102 52, 102 70 Z" fill="currentColor" fillOpacity={0.2} />
    <path d="M 18 70 C 18 52, 28 30, 60 14 C 92 30, 102 52, 102 70" />
    <path d="M 18 70 L 102 70" />
    <path d="M 48 70 L 48 52 L 60 44 L 72 52 L 72 70" />
  </svg>
);

/** Dos círculos entrelazados — equipo / eslabón. */
export const OrnChainLinks = (p: P) => (
  <svg {...wrap(p, 120, 60)}>
    <circle cx={50} cy={30} r={20} />
    <circle cx={72} cy={30} r={20} />
  </svg>
);

/** Globo de diálogo orgánico con 3 puntos. */
export const OrnSpeechBubble = (p: P) => (
  <svg {...wrap(p, 120, 80)}>
    <path d="M 20 24 C 22 14, 32 10, 60 10 C 90 10, 102 18, 102 36 C 102 52, 92 60, 60 60 C 56 60, 52 60, 48 59 L 32 70 L 36 56 C 26 50, 20 42, 20 24 Z" />
    <circle cx={46} cy={34} r={2.5} fill="currentColor" />
    <circle cx={60} cy={34} r={2.5} fill="currentColor" />
    <circle cx={74} cy={34} r={2.5} fill="currentColor" />
  </svg>
);

/** Cuadrícula 6x3 con una celda destacada en gold. */
export const OrnGridCalendar = (p: P) => (
  <svg {...wrap(p, 140, 80)} strokeWidth={1.2}>
    <rect x={10} y={8} width={120} height={64} rx={6} />
    <path d="M 10 22 L 130 22" />
    <g strokeOpacity={0.5}>
      <path d="M 30 22 L 30 72 M 50 22 L 50 72 M 70 22 L 70 72 M 90 22 L 90 72 M 110 22 L 110 72" />
      <path d="M 10 38 L 130 38 M 10 54 L 130 54" />
    </g>
    <rect x={72} y={42} width={16} height={10} fill="#B8923E" fillOpacity={0.6} stroke="none" rx={2} />
  </svg>
);

/** Lupa hairline con interior vacío. */
export const OrnSearchEmpty = (p: P) => (
  <svg {...wrap(p, 100, 80)}>
    <circle cx={40} cy={36} r={22} />
    <path d="M 58 54 L 80 70" />
  </svg>
);

/** Piezas de rompecabezas desconectadas (integraciones). */
export const OrnPuzzlePieces = (p: P) => (
  <svg {...wrap(p, 120, 80)}>
    <path d="M 16 18 L 50 18 L 50 36 C 50 40, 54 42, 58 42 C 62 42, 66 40, 66 36 L 66 18 L 100 18 L 100 50 L 82 50 C 78 50, 76 54, 76 58 C 76 62, 78 66, 82 66 L 100 66 L 100 74 L 16 74 Z" />
    <path d="M 16 18 L 16 38" strokeDasharray="2 3" />
    <path d="M 100 50 L 100 66" strokeDasharray="2 3" />
  </svg>
);

/** Marco de cuadro vacío (galería). */
export const OrnFrameEmpty = (p: P) => (
  <svg {...wrap(p, 120, 80)}>
    <rect x={14} y={10} width={92} height={60} rx={3} />
    <rect x={22} y={18} width={76} height={44} rx={2} strokeDasharray="3 4" strokeOpacity={0.6} />
    <circle cx={40} cy={34} r={3} />
    <path d="M 32 56 L 50 40 L 64 52 L 78 38 L 92 52" />
  </svg>
);

/** Línea de tiempo con dots espaciados (audit logs). */
export const OrnTimelineDots = (p: P) => (
  <svg {...wrap(p, 140, 40)}>
    <path d="M 8 20 L 132 20" />
    <circle cx={20} cy={20} r={3.5} fill="currentColor" />
    <circle cx={50} cy={20} r={3.5} fill="currentColor" fillOpacity={0.5} />
    <circle cx={80} cy={20} r={3.5} fill="currentColor" fillOpacity={0.3} />
    <circle cx={110} cy={20} r={3.5} fill="currentColor" fillOpacity={0.5} />
  </svg>
);

/** Llave hairline orgánica (permisos / 403). */
export const OrnKeyOrganic = (p: P) => (
  <svg {...wrap(p, 100, 80)}>
    <circle cx={30} cy={40} r={14} />
    <circle cx={30} cy={40} r={4} />
    <path d="M 44 40 L 84 40" />
    <path d="M 70 40 L 70 50" />
    <path d="M 80 40 L 80 48" />
  </svg>
);

/** Curva orgánica desinflada / partida (500). */
export const OrnCurveBroken = (p: P) => (
  <svg {...wrap(p, 140, 60)}>
    <path d="M 8 40 C 30 18, 50 46, 64 32 L 70 26" />
    <path d="M 78 18 L 88 28 C 100 40, 120 22, 132 40" strokeDasharray="2 3" />
    <path d="M 72 20 L 76 16" />
    <path d="M 72 30 L 76 34" />
  </svg>
);

/** Tres puntos suspensivos en arco curvo (nada urgente). */
export const OrnDotsArc = (p: P) => (
  <svg {...wrap(p, 100, 40)} strokeWidth={1.4}>
    <path d="M 8 28 C 24 14, 40 30, 50 22 S 76 14, 92 22" />
    <circle cx={28} cy={24} r={2} fill="currentColor" />
    <circle cx={50} cy={22} r={2} fill="currentColor" />
    <circle cx={72} cy={20} r={2} fill="currentColor" />
  </svg>
);

/** 404 stroke digits — sólo el "404" en Fraunces oldstyle dibujado como ornamento. */
export function Orn404({ className }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <span
        aria-hidden
        className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold"
      />
      <span
        aria-hidden
        className="block font-serif font-light text-[120px] leading-none tracking-[-0.04em]"
        style={{
          fontVariantNumeric: "oldstyle-nums",
          fontFeatureSettings: '"onum"',
          WebkitTextStroke: "1px var(--color-rule-strong)",
          color: "transparent",
        }}
      >
        404
      </span>
    </div>
  );
}
