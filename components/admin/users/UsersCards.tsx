"use client";

import type { AdminUserRow } from "@/lib/admin";
import { RolePill, StatusPill } from "./UserPills";

export function UsersCards({
  rows,
  onCardClick,
}: {
  rows: AdminUserRow[];
  onCardClick: (id: string) => void;
}) {
  return (
    <div className="md:hidden flex flex-col gap-2.5">
      {rows.map((r) => {
        const isSuper = r.role === "super_admin";
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onCardClick(r.id)}
            className="text-left bg-paper border border-rule rounded-2xl p-4 hover:border-rule-strong transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className={`w-10 h-10 rounded-full inline-flex items-center justify-center text-[14px] font-medium ${
                  isSuper
                    ? "bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)]"
                    : "bg-sage-tint text-sage"
                }`}
              >
                {r.initials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-serif italic font-medium text-[16px] text-ink m-0 mb-0.5 tracking-[-0.01em]">
                  {r.fullName}
                </p>
                <p className="text-xs text-ink-muted m-0 truncate">{r.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-rule">
              <div className="flex flex-wrap gap-1.5">
                <RolePill role={r.role} />
                <StatusPill status={r.status} />
              </div>
              <span
                className="text-[12px] text-ink-soft shrink-0"
                style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
              >
                {r.lastSeenLabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
