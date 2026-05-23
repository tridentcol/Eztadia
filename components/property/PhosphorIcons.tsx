import type { SVGProps } from "react";
import type { Amenity } from "@/lib/properties";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function WifiHigh(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 18.5h.01" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <path d="M5 12.5a9 9 0 0 1 14 0" />
      <path d="M2 9.5a13 13 0 0 1 20 0" />
    </svg>
  );
}
export function ThermometerSimple(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M10 4a2 2 0 1 1 4 0v10.5a4 4 0 1 1-4 0V4z" />
    </svg>
  );
}
export function Drop(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z" />
    </svg>
  );
}
export function Coffee(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" />
      <path d="M17 11h2a2 2 0 0 1 0 4h-2" />
      <path d="M8 4c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M12 4c0 1 1 1 1 2s-1 1-1 2" />
    </svg>
  );
}
export function Car(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 13l2-5h10l2 5" />
      <path d="M3 13h18v5H3z" />
      <circle cx={7} cy={18} r={1.5} />
      <circle cx={17} cy={18} r={1.5} />
    </svg>
  );
}
export function Bell(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5L6 17z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function Tree(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3c2 0 4 1.5 4 4 2 0 3.5 1.5 3.5 3.5 0 2-1.5 3.5-3.5 3.5h-8c-2 0-3.5-1.5-3.5-3.5C4.5 8.5 6 7 8 7c0-2.5 2-4 4-4z" />
      <path d="M12 14v7" />
    </svg>
  );
}
export function TShirt(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 4l-5 2 1.5 4L8 9v11h8V9l2.5 1L20 6l-5-2-1.5 2a2.5 2.5 0 0 1-3 0L9 4z" />
    </svg>
  );
}

export function Calendar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x={3} y={5} width={18} height={16} rx={2} />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function Plus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
export function Minus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14" />
    </svg>
  );
}
export function ChevronLeft(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
export function ChevronRight(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
export function MapPin(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
      <circle cx={12} cy={10} r={3} />
    </svg>
  );
}
export function Copy(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x={8} y={8} width={13} height={13} rx={2} />
      <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
    </svg>
  );
}
export function Star(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/* Map amenity key → icon + label */
export const AMENITY_META: Record<Amenity, { Icon: (p: IconProps) => JSX.Element; label: string }> = {
  wifi:      { Icon: WifiHigh,          label: "Wifi fibra" },
  ac:        { Icon: ThermometerSimple, label: "Aire acondicionado" },
  pool:      { Icon: Drop,              label: "Piscina pequeña" },
  breakfast: { Icon: Coffee,            label: "Desayuno incluido" },
  parking:   { Icon: Car,               label: "Parqueadero" },
  reception: { Icon: Bell,              label: "Recepción 24h" },
  patio:     { Icon: Tree,              label: "Patio colonial" },
  laundry:   { Icon: TShirt,            label: "Lavandería" },
};
