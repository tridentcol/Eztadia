import type { ReactNode } from "react";
import Link from "next/link";
import {
  OrnCalendarEmpty,
  OrnHouseOrganic,
  OrnChainLinks,
  OrnSpeechBubble,
  OrnGridCalendar,
  OrnSearchEmpty,
  OrnPuzzlePieces,
  OrnFrameEmpty,
  OrnTimelineDots,
  OrnDotsArc,
} from "./Ornaments";

export type OrnamentKey =
  | "calendar-empty"
  | "house"
  | "chain"
  | "speech"
  | "grid-calendar"
  | "search"
  | "puzzle"
  | "frame"
  | "timeline"
  | "dots-arc";

const ORN: Record<OrnamentKey, (p: { className?: string }) => JSX.Element> = {
  "calendar-empty": OrnCalendarEmpty,
  house: OrnHouseOrganic,
  chain: OrnChainLinks,
  speech: OrnSpeechBubble,
  "grid-calendar": OrnGridCalendar,
  search: OrnSearchEmpty,
  puzzle: OrnPuzzlePieces,
  frame: OrnFrameEmpty,
  timeline: OrnTimelineDots,
  "dots-arc": OrnDotsArc,
};

export type EmptyAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "outline-sage" | "terracotta" | "ghost-sage";
};

export type EmptyStateProps = {
  ornament: OrnamentKey;
  ornamentTone?: "gold" | "sage";
  title: string;
  body?: ReactNode;
  actions?: EmptyAction[];
  small?: boolean;
  className?: string;
};

export function EmptyState({
  ornament,
  ornamentTone = "gold",
  title,
  body,
  actions = [],
  small = false,
  className = "",
}: EmptyStateProps) {
  const Orn = ORN[ornament];
  const ornCls =
    ornamentTone === "gold"
      ? "text-gold opacity-65"
      : "text-sage opacity-55";

  return (
    <div
      role="status"
      className={`max-w-[480px] mx-auto text-center ${small ? "py-8" : "py-14"} px-4 ${className}`}
    >
      <Orn className={`mx-auto mb-6 ${ornCls}`} />
      <h3
        className={[
          "font-serif italic font-medium text-ink m-0 mb-3 tracking-[-0.02em] leading-[1.1]",
          small ? "text-[22px]" : "text-[28px]",
        ].join(" ")}
      >
        {title}
      </h3>
      {body && (
        <p
          className={[
            "text-ink-soft leading-[1.55] m-0 max-w-[44ch] mx-auto",
            small ? "text-sm mb-4" : "text-[15px] mb-6",
          ].join(" ")}
        >
          {body}
        </p>
      )}
      {actions.length > 0 && (
        <div className="inline-flex gap-2 flex-wrap justify-center">
          {actions.map((a, i) => (
            <ActionBtn key={i} action={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ action }: { action: EmptyAction }) {
  const cls = {
    "outline-sage":
      "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint transition-colors",
    terracotta:
      "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-terracotta text-cream text-sm font-medium hover:bg-clay transition-colors",
    "ghost-sage":
      "inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg bg-transparent text-sage text-[13px] font-medium hover:bg-sage-tint transition-colors",
  }[action.variant ?? "outline-sage"];

  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}
