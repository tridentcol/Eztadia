import { IconWarningCircle, IconClock } from "./icons";

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 px-4 py-3 rounded-[10px] mb-[22px] text-sm leading-[1.45] text-ink"
      style={{
        background: "var(--color-terracotta-tint, rgba(199,111,76,0.12))",
        borderLeft: "3px solid var(--color-clay)",
      }}
    >
      <IconWarningCircle className="w-4 h-4 flex-shrink-0 mt-[3px] text-clay" />
      <span>{children}</span>
    </div>
  );
}

export function WarnBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 px-4 py-3 rounded-[10px] mb-[22px] text-sm leading-[1.45] text-ink"
      style={{
        background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
        borderLeft: "3px solid var(--color-gold)",
      }}
    >
      <IconClock className="w-4 h-4 flex-shrink-0 mt-[3px] text-gold-dark" />
      <span>{children}</span>
    </div>
  );
}
