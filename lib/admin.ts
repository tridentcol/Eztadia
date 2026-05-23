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

/* ─── DEMO DATA ─── */

export function getGlobalKpis(): GlobalKpi[] {
  return [
    {
      key: "users",
      overline: "Usuarios registrados",
      value: 47,
      trend: { label: "↑ 12 nuevos este mes", tone: "sage" },
      breakdown: "23 owners · 18 staff · 6 super_admin",
    },
    {
      key: "properties",
      overline: "Propiedades",
      value: 12,
      trend: { label: "↑ 3 nuevas este mes", tone: "sage" },
      breakdown: "9 activas · 2 en onboarding · 1 pausada",
    },
    {
      key: "bookings",
      overline: "Reservas",
      value: 234,
      trend: { label: "↑ 18% vs abril", tone: "gold" },
      breakdown: "187 confirmadas · 22 completadas · 25 canceladas",
    },
  ];
}

export function getRevenueSnapshot(): RevenueSnapshot {
  const heights = [
    38, 52, 30, 24, 64, 70, 58, 42, 60, 80,
    72, 95, 88, 65, 50, 56, 70, 78, 60, 48,
    84,
  ];
  const days: RevenueDay[] = [];
  for (let d = 1; d <= 31; d++) {
    const h = heights[d - 1];
    if (h !== undefined) {
      days.push({
        day: d,
        amountCOP: Math.round(h / 100 * 5_000_000),
        isToday: d === 21,
      });
    } else {
      days.push({ day: d, amountCOP: 0, isFuture: true });
    }
  }
  return {
    monthLabel: "Mayo 2026",
    totalCOP: 48_200_000,
    averagePerBookingCOP: 210_000,
    bestDay: { dayLabel: "12 may", amountCOP: 4_800_000 },
    commissionCOP: 0,
    days,
  };
}

export function getRecentEvents(): SystemEvent[] {
  return [
    { id: "e1", time: "14:32", kind: "reserva", text: "Nueva reserva confirmada — Casa Marina · Andrea Mendoza · $1.350.000" },
    { id: "e2", time: "14:28", kind: "webhook", text: "Wompi webhook procesado · TXN_3KdSnJ4kfL2 aprobado" },
    { id: "e3", time: "14:15", kind: "usuario", text: "Nuevo signup · cristina.rojas@gmail.com · pendiente verificación" },
    { id: "e4", time: "13:50", kind: "sync", text: "iCal sync completado · 12 propiedades · 4 cambios" },
    { id: "e5", time: "13:42", kind: "error", text: "WhatsApp send failed · plantilla no aprobada · Villa Serena" },
    { id: "e6", time: "13:30", kind: "login", text: "carlos@casamarina.co inició sesión · IP 190.85.x.x" },
    { id: "e7", time: "13:18", kind: "reserva", text: "Reserva creada (pendiente pago) — Hotel Bosque · Luis Pérez · $960.000" },
    { id: "e8", time: "12:55", kind: "email", text: "Email de confirmación enviado · 87 destinatarios este día" },
    { id: "e9", time: "12:40", kind: "payment", text: "PSE confirmado · Complejo Aguas Claras · Familia Rodríguez · $2.400.000" },
    { id: "e10", time: "11:30", kind: "usuario", text: "Owner verificó email · M. González · Hotel Sur" },
    { id: "e11", time: "10:42", kind: "login", text: "maria.restrepo@casamarina.co inició sesión · IP 190.85.x.x" },
    { id: "e12", time: "09:18", kind: "error", text: "Webhook timeout · Wompi /events · reintentando en 5 min" },
  ];
}

export function getTopProperties(): TopProperty[] {
  return [
    { rank: 1, name: "Casa Marina", bookings: 32, revenueLabel: "$4,8M" },
    { rank: 2, name: "Villa Serena", bookings: 28, revenueLabel: "$4,1M" },
    { rank: 3, name: "Hotel Bosque", bookings: 24, revenueLabel: "$3,6M" },
    { rank: 4, name: "Complejo Aguas Claras", bookings: 19, revenueLabel: "$2,9M" },
    { rank: 5, name: "La Esquina del Sol", bookings: 17, revenueLabel: "$2,4M" },
  ];
}

export function getAttentionProperties(): AttentionProperty[] {
  return [
    { name: "Casa de los Mangos", reason: "Sin actividad hace 12 días" },
    { name: "Hotel Sur", reason: "Webhook Wompi falló 3 veces hoy" },
    { name: "Villa Las Olas", reason: "Onboarding incompleto · paso 2" },
  ];
}

export function getAdminUsers(): AdminUserRow[] {
  return [
    {
      id: "usr_csj",
      fullName: "Carlos San Juan",
      initials: "CS",
      email: "carlos@casamarina.co",
      role: "super_admin",
      propertiesLabel: "1 propiedad · Casa Marina",
      propertiesCount: 1,
      lastSeenLabel: "hace 30 min",
      status: "active",
      isYou: true,
    },
    {
      id: "usr_sr",
      fullName: "Sofía Restrepo",
      initials: "SR",
      email: "sofia@villaserena.co",
      role: "owner",
      propertiesLabel: "1 · Villa Serena",
      propertiesCount: 1,
      lastSeenLabel: "hace 2 horas",
      status: "active",
    },
    {
      id: "usr_dm",
      fullName: "Diego Mora",
      initials: "DM",
      email: "diego@hotelbosque.co",
      role: "owner",
      propertiesLabel: "2 propiedades",
      propertiesCount: 2,
      lastSeenLabel: "hace 5 horas",
      status: "active",
    },
    {
      id: "usr_mr",
      fullName: "María Restrepo",
      initials: "MR",
      email: "maria.restrepo@casamarina.co",
      role: "manager",
      propertiesLabel: "1 · Casa Marina",
      propertiesCount: 1,
      lastSeenLabel: "hace 2 horas",
      status: "active",
    },
    {
      id: "usr_cr",
      fullName: "Cristina Rojas",
      initials: "CR",
      email: "cristina.rojas@gmail.com",
      role: "owner",
      propertiesLabel: "— sin propiedad —",
      propertiesCount: 0,
      lastSeenLabel: "nunca",
      status: "pending",
    },
    {
      id: "usr_ag",
      fullName: "Andrés Gómez",
      initials: "AG",
      email: "andres@casamarina.co",
      role: "reception",
      propertiesLabel: "1 · Casa Marina",
      propertiesCount: 1,
      lastSeenLabel: "hace 5 días",
      status: "active",
    },
    {
      id: "usr_jf",
      fullName: "Juliana Forero",
      initials: "JF",
      email: "juliana@aguasclaras.co",
      role: "owner",
      propertiesLabel: "1 · Complejo Aguas Claras",
      propertiesCount: 1,
      lastSeenLabel: "hace 1 día",
      status: "active",
    },
    {
      id: "usr_rp",
      fullName: "Ricardo Páez",
      initials: "RP",
      email: "ricardo@hotelsur.co",
      role: "owner",
      propertiesLabel: "1 · Hotel Sur",
      propertiesCount: 1,
      lastSeenLabel: "hace 12 días",
      status: "suspended",
    },
    {
      id: "usr_vl",
      fullName: "Valentina López",
      initials: "VL",
      email: "valentina@lasolas.co",
      role: "owner",
      propertiesLabel: "1 · Villa Las Olas (onboarding)",
      propertiesCount: 1,
      lastSeenLabel: "hace 3 horas",
      status: "pending",
    },
    {
      id: "usr_eb",
      fullName: "Emilio Bermúdez",
      initials: "EB",
      email: "emilio@mangos.co",
      role: "owner",
      propertiesLabel: "1 · Casa de los Mangos",
      propertiesCount: 1,
      lastSeenLabel: "hace 12 días",
      status: "active",
    },
  ];
}

const DETAILS: Record<string, AdminUserDetail> = {
  usr_sr: {
    id: "usr_sr",
    fullName: "Sofía Restrepo",
    initials: "SR",
    email: "sofia@villaserena.co",
    role: "owner",
    propertiesLabel: "1 · Villa Serena",
    propertiesCount: 1,
    lastSeenLabel: "hace 2 horas",
    status: "active",
    phone: "+57 312 555 0099",
    country: "Colombia",
    createdAtLabel: "12 abril 2026",
    lastLoginLabel: "Hoy, 12:34",
    lastIp: "190.85.x.x",
    properties: [
      { id: "p_villaserena", name: "Villa Serena", sub: "Salento, Quindío · 8 habitaciones", role: "owner" },
    ],
    logins: [
      { device: "Mac · Safari", location: "Salento", at: "Hoy, 12:34", ip: "190.85.x.x" },
      { device: "iPhone · App", location: "Salento", at: "Ayer, 19:48", ip: "190.85.x.x" },
      { device: "Mac · Safari", location: "Bogotá", at: "14 may, 09:15", ip: "181.49.x.x" },
      { device: "Mac · Safari", location: "Salento", at: "12 abr, 16:00", ip: "190.85.x.x" },
    ],
  },
};

export function getAdminUserDetail(id: string): AdminUserDetail | null {
  return DETAILS[id] ?? null;
}

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
