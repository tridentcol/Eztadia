import type { StaffRole } from "@/lib/staff";
import { ROLE_LABEL } from "@/lib/staff";

export function RolePill({ role }: { role: StaffRole }) {
  const cls = {
    owner: "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
    manager: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    reception: "bg-linen text-ink-soft border-rule",
  }[role];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border whitespace-nowrap ${cls}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
