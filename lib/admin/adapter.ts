import type {
  AdminUserPropertyLink,
  AdminUserViewRow,
  AdminUserDetailFull,
  AdminOverview,
  AdminAuditLogRow,
} from "@/lib/db/queries/admin";
import type {
  AdminUserDetail,
  AdminUserRole,
  AdminUserRow,
  AdminUserStatus,
  GlobalKpi,
  RevenueSnapshot,
  SystemEvent,
  TopProperty,
  AttentionProperty,
  EventKind,
} from "@/lib/admin";

/**
 * Convierte `profiles.role` + `property_users.role` a la lente AdminUserRole
 * que usa la UI. Si el user tiene un property_users con role !== owner, eso
 * gana (refleja el role *operativo*).
 */
function pickUiRole(
  profileRole: AdminUserViewRow["role"],
  properties: AdminUserPropertyLink[],
): AdminUserRole {
  if (profileRole === "super_admin") return "super_admin";
  // Si tiene al menos una propiedad como owner → owner. Si solo es staff,
  // refleja el rol staff. Fallback al rol del profile.
  const pu = properties[0]?.role;
  if (pu === "owner") return "owner";
  if (pu === "manager") return "manager";
  if (pu === "reception") return "reception";
  if (profileRole === "staff_manager") return "manager";
  if (profileRole === "staff_reception") return "reception";
  return "owner";
}

function pickStatus(row: AdminUserViewRow): AdminUserStatus {
  // Sin acceptedAt → pending (invitación abierta o user recién creado sin link).
  if (row.acceptedAt === null) return "pending";
  // No hay "suspended" en schema todavía. Cuando agreguemos ban_until via
  // auth.users, lo mapeamos aquí.
  return "active";
}

function initialsFromName(name: string | null, email: string): string {
  const src = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

function propertiesLabel(properties: AdminUserPropertyLink[]): string {
  if (properties.length === 0) return "— sin propiedad —";
  if (properties.length === 1) return `1 · ${properties[0]!.name}`;
  return `${properties.length} propiedades`;
}

/**
 * Formatea timestamp relativo en español: "hace 30 min", "hace 2 horas", etc.
 * Si null devuelve "nunca". Convención hotelera + Colombia.
 */
export function formatRelativeEs(iso: string | null): string {
  if (!iso) return "nunca";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 60) return "hace un momento";
  const min = Math.round(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `hace ${hr} ${hr === 1 ? "hora" : "horas"}`;
  const days = Math.round(hr / 24);
  if (days < 30) return `hace ${days} ${days === 1 ? "día" : "días"}`;
  const months = Math.round(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.round(months / 12);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
}

function formatDateEs(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function deviceFromUA(ua: string | null): string {
  if (!ua) return "Desconocido";
  const lower = ua.toLowerCase();
  let device = "Desktop";
  if (lower.includes("iphone") || lower.includes("android")) device = "Mobile";
  if (lower.includes("ipad")) device = "Tablet";
  let browser = "Browser";
  if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("edg")) browser = "Edge";
  return `${device} · ${browser}`;
}

export function toAdminUserRow(
  row: AdminUserViewRow,
  currentUserId: string | null,
): AdminUserRow {
  const role = pickUiRole(row.role, row.properties);
  return {
    id: row.id,
    fullName: row.fullName ?? row.email.split("@")[0] ?? row.email,
    initials: initialsFromName(row.fullName, row.email),
    email: row.email,
    role,
    propertiesLabel: propertiesLabel(row.properties),
    propertiesCount: row.properties.length,
    lastSeenLabel: formatRelativeEs(row.lastLoginAt),
    status: pickStatus(row),
    isYou: currentUserId === row.id,
  };
}

/* ─── OVERVIEW adapters ─── */

function fmtMoneyCOP(cents: number): string {
  const value = cents / 100;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toLocaleString("es-CO")}`;
}

function toRoleBreakdown(byRole: Record<string, number>): string {
  const parts: string[] = [];
  if (byRole.owner) parts.push(`${byRole.owner} owners`);
  const staff = (byRole.staff_manager ?? 0) + (byRole.staff_reception ?? 0);
  if (staff) parts.push(`${staff} staff`);
  if (byRole.super_admin) parts.push(`${byRole.super_admin} super_admin`);
  return parts.join(" · ") || "Sin clasificar";
}

function toBookingsBreakdown(byStatus: Record<string, number>): string {
  const parts: string[] = [];
  if (byStatus.confirmed) parts.push(`${byStatus.confirmed} confirmadas`);
  if (byStatus.completed) parts.push(`${byStatus.completed} completadas`);
  if (byStatus.cancelled) parts.push(`${byStatus.cancelled} canceladas`);
  if (byStatus.pending_payment) parts.push(`${byStatus.pending_payment} pendientes`);
  return parts.join(" · ") || "Sin datos";
}

export function toGlobalKpis(overview: AdminOverview): GlobalKpi[] {
  const u = overview.kpis.users;
  const p = overview.kpis.properties;
  const b = overview.kpis.bookings;
  const bookingDelta = b.thisMonth - b.prevMonth;
  const bookingTrend = b.prevMonth > 0
    ? `${bookingDelta >= 0 ? "↑" : "↓"} ${Math.abs(Math.round((bookingDelta / b.prevMonth) * 100))}% vs mes pasado`
    : `${b.thisMonth} este mes`;
  return [
    {
      key: "users",
      overline: "Usuarios registrados",
      value: u.total,
      trend: {
        label: u.newThisMonth > 0 ? `↑ ${u.newThisMonth} nuevos este mes` : "Sin altas este mes",
        tone: "sage",
      },
      breakdown: toRoleBreakdown(u.byRole),
    },
    {
      key: "properties",
      overline: "Propiedades",
      value: p.total,
      trend: {
        label: p.newThisMonth > 0 ? `↑ ${p.newThisMonth} nuevas este mes` : "Sin altas este mes",
        tone: "sage",
      },
      breakdown: `${p.active} activas${p.inactive > 0 ? ` · ${p.inactive} desactivadas` : ""}`,
    },
    {
      key: "bookings",
      overline: "Reservas",
      value: b.total,
      trend: { label: bookingTrend, tone: bookingDelta >= 0 ? "gold" : "sage" },
      breakdown: toBookingsBreakdown(b.byStatus),
    },
  ];
}

export function toRevenueSnapshot(overview: AdminOverview): RevenueSnapshot {
  const r = overview.revenue;
  return {
    monthLabel: r.monthLabel,
    totalCOP: Math.round(r.totalCents / 100),
    averagePerBookingCOP: Math.round(r.averagePerBookingCents / 100),
    bestDay: r.bestDay
      ? { dayLabel: r.bestDay.date, amountCOP: Math.round(r.bestDay.cents / 100) }
      : { dayLabel: "—", amountCOP: 0 },
    commissionCOP: 0,
    days: r.days.map((d) => ({
      day: d.day,
      amountCOP: Math.round(d.cents / 100),
      isToday: d.isToday,
      isFuture: d.isFuture,
    })),
  };
}

const AUDIT_KIND_MAP: Record<string, EventKind> = {
  booking: "reserva",
  booking_hold: "reserva",
  payment: "payment",
  property: "usuario",
  property_user: "usuario",
  user: "login",
  audit: "error",
};

function eventKindFromAudit(row: AdminAuditLogRow): EventKind {
  if (row.actorType === "webhook") return "webhook";
  const mapped = AUDIT_KIND_MAP[row.resourceType];
  if (mapped) return mapped;
  if (row.action.includes("error") || row.action.includes("fail")) return "error";
  if (row.action.includes("login")) return "login";
  if (row.action.includes("email")) return "email";
  return "usuario";
}

function eventTextFromAudit(row: AdminAuditLogRow): string {
  const who =
    row.actorType === "webhook"
      ? "Webhook"
      : row.actor?.fullName ?? row.actor?.email ?? "Sistema";
  const what = row.action.replaceAll(".", " · ").replaceAll("_", " ");
  const propLabel = row.property ? ` — ${row.property.name}` : "";
  return `${who} · ${what}${propLabel}`;
}

function eventTimeFromIso(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function toSystemEvents(overview: AdminOverview): SystemEvent[] {
  return overview.recentEvents.map((row) => ({
    id: row.id,
    time: eventTimeFromIso(row.createdAt),
    kind: eventKindFromAudit(row),
    text: eventTextFromAudit(row),
  }));
}

export function toTopProperties(overview: AdminOverview): TopProperty[] {
  return overview.topProperties.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    bookings: p.bookingsCount,
    revenueLabel: fmtMoneyCOP(p.revenueCents),
  }));
}

export function toAttentionProperties(overview: AdminOverview): AttentionProperty[] {
  return overview.attentionProperties.map((p) => ({
    name: p.name,
    reason: p.reason,
  }));
}

export function toAdminUserDetail(
  full: AdminUserDetailFull,
  currentUserId: string | null,
): AdminUserDetail {
  const baseRow = toAdminUserRow(full, currentUserId);
  return {
    ...baseRow,
    phone: full.phone ?? "—",
    country: full.recentLogins[0]?.country ?? "—",
    createdAtLabel: formatDateEs(full.createdAt),
    lastLoginLabel: full.lastLoginAt
      ? `${formatDateEs(full.lastLoginAt)} · ${formatRelativeEs(full.lastLoginAt)}`
      : "Nunca",
    lastIp: full.recentLogins[0]?.ip ?? "—",
    properties: full.properties.map((p) => ({
      id: p.id,
      name: p.name,
      sub: `/${p.slug}`,
      role: pickUiRole(full.role, [p]),
    })),
    logins: full.recentLogins.map((ev) => ({
      device: deviceFromUA(ev.userAgent),
      location: ev.country ?? "—",
      at: formatDateEs(ev.createdAt),
      ip: ev.ip ?? "—",
    })),
  };
}
