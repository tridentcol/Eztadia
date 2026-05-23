import type { AdminUserRole, AdminUserStatus } from "@/lib/admin";
import { ROLE_LABEL, STATUS_LABEL } from "@/lib/admin";

export function RolePill({ role }: { role: AdminUserRole }) {
  const cls = {
    super_admin: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
    owner: "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
    manager: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    reception: "bg-linen text-ink-soft border-rule",
  }[role];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[10.5px] font-medium uppercase tracking-[0.06em] border whitespace-nowrap ${cls}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

export function StatusPill({ status }: { status: AdminUserStatus }) {
  const map = {
    active: {
      cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
      dot: "bg-sage",
    },
    pending: {
      cls: "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
      dot: "bg-gold",
    },
    suspended: {
      cls: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
      dot: "bg-clay",
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[10.5px] font-medium uppercase tracking-[0.06em] border whitespace-nowrap ${map.cls}`}
    >
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
