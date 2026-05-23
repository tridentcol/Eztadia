export type GlobalKpi = {
  key: "users" | "properties" | "bookings";
  overline: string;
  value: number;
  trend: { label: string; tone: "sage" | "gold" };
  breakdown: string;
};

export type RevenueDay = { day: number; amountCOP: number; isToday?: boolean; isFuture?: boolean };

export type RevenueSnapshot = {
  monthLabel: string;
  totalCOP: number;
  averagePerBookingCOP: number;
  bestDay: { dayLabel: string; amountCOP: number };
  commissionCOP: number;
  days: RevenueDay[];
};

export type EventKind =
  | "reserva"
  | "webhook"
  | "usuario"
  | "sync"
  | "error"
  | "login"
  | "email"
  | "payment";

export type SystemEvent = {
  id: string;
  time: string; // "14:32"
  kind: EventKind;
  text: string; // pre-formatted plain (component will render with mono spans where needed)
};

export type TopProperty = {
  rank: number;
  name: string;
  bookings: number;
  revenueLabel: string;
};

export type AttentionProperty = {
  name: string;
  reason: string;
};

export type AdminUserRole = "super_admin" | "owner" | "manager" | "reception";

export type AdminUserStatus = "active" | "pending" | "suspended";

export type AdminUserRow = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  role: AdminUserRole;
  propertiesLabel: string;
  propertiesCount: number;
  lastSeenLabel: string;
  status: AdminUserStatus;
  isYou?: boolean;
};

export type AdminUserDetail = AdminUserRow & {
  phone: string;
  country: string;
  createdAtLabel: string;
  lastLoginLabel: string;
  lastIp: string;
  properties: { id: string; name: string; sub: string; role: AdminUserRole }[];
  logins: { device: string; location: string; at: string; ip: string }[];
};

export const ROLE_LABEL: Record<AdminUserRole, string> = {
  super_admin: "super_admin",
  owner: "Owner",
  manager: "Manager",
  reception: "Reception",
};

export const STATUS_LABEL: Record<AdminUserStatus, string> = {
  active: "Activo",
  pending: "Pendiente",
  suspended: "Suspendido",
};
