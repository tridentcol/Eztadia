"use client";

import type { PropertyType } from "@/lib/onboarding-store";
import { IconHouse, IconBuildings, IconTents } from "./icons";

const OPTIONS: {
  key: Exclude<PropertyType, "">;
  title: string;
  sub: string;
  Icon: typeof IconHouse;
}[] = [
  { key: "hotel", title: "Hotel boutique", sub: "Habitaciones individuales", Icon: IconHouse },
  { key: "building", title: "Edificio", sub: "Apartamentos o estudios", Icon: IconBuildings },
  { key: "complex", title: "Complejo", sub: "Cabañas o casas separadas", Icon: IconTents },
];

export function TypeRadioCards({
  value,
  onChange,
  variant = "grid",
}: {
  value: PropertyType;
  onChange: (next: Exclude<PropertyType, "">) => void;
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <div className="flex flex-col gap-2">
        {OPTIONS.map(({ key, title, sub, Icon }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(key)}
              className={[
                "flex items-center gap-3 text-left rounded-[14px] transition-[border-color,background-color,padding] duration-200",
                "min-h-[68px]",
                active
                  ? "border-2 border-sage bg-[rgba(229,237,229,0.4)] px-[14px] py-[13px]"
                  : "border border-rule bg-paper p-4 hover:border-rule-strong",
              ].join(" ")}
            >
              <Icon className={`w-7 h-7 shrink-0 ${active ? "text-sage" : "text-ink-soft"}`} />
              <span className="flex-1">
                <span className="block font-serif italic font-medium text-[15px] text-ink leading-[1.2] tracking-[-0.005em]">
                  {title}
                </span>
                <span className="block text-[11px] font-medium tracking-[0.04em] text-ink-muted mt-0.5">
                  {sub}
                </span>
              </span>
              {active && (
                <span
                  aria-hidden
                  className="w-[14px] h-[14px] rounded-full border-[1.5px] border-sage"
                  style={{
                    background:
                      "radial-gradient(circle, var(--color-sage) 0 4px, transparent 4px)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-2.5">
      {OPTIONS.map(({ key, title, sub, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={[
              "relative text-center rounded-[14px] transition-[border-color,background-color,padding] duration-200",
              "min-h-[110px] flex flex-col items-center justify-center",
              active
                ? "border-2 border-sage bg-[rgba(229,237,229,0.4)] px-[13px] py-[17px]"
                : "border border-rule bg-paper px-3.5 py-[18px] hover:border-rule-strong",
            ].join(" ")}
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-2.5 right-2.5 w-[14px] h-[14px] rounded-full border-[1.5px] border-sage"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-sage) 0 4px, transparent 4px)",
                }}
              />
            )}
            <Icon className={`w-7 h-7 mb-2.5 ${active ? "text-sage" : "text-ink-soft"}`} />
            <span className="block font-serif italic font-medium text-[15px] text-ink leading-[1.2] mb-1 tracking-[-0.005em]">
              {title}
            </span>
            <span className="block text-[11px] font-medium tracking-[0.04em] text-ink-muted">
              {sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
