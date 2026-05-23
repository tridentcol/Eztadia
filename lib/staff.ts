export type StaffRole = "owner" | "manager" | "reception";

export const ROLE_LABEL: Record<StaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  reception: "Reception",
};

export type StaffMember = {
  id: string;
  email: string;
  fullName: string | null; // null when invitation is still pending
  initials: string;
  role: StaffRole;
  status:
    | { kind: "active"; lastSeenLabel: string }
    | { kind: "inactive"; lastSeenLabel: string }
    | { kind: "pending-invite"; expiresInDays: number };
  isYou?: boolean;
};

export function getStaff(): StaffMember[] {
  return [
    {
      id: "u-carlos",
      email: "carlos@casamarina.co",
      fullName: "Carlos San Juan",
      initials: "CS",
      role: "owner",
      status: { kind: "active", lastSeenLabel: "hace 30 min" },
      isYou: true,
    },
    {
      id: "u-maria",
      email: "maria.restrepo@casamarina.co",
      fullName: "María Restrepo",
      initials: "MR",
      role: "manager",
      status: { kind: "active", lastSeenLabel: "hace 2 horas" },
    },
    {
      id: "u-andres",
      email: "andres@casamarina.co",
      fullName: "Andrés Gómez",
      initials: "AG",
      role: "reception",
      status: { kind: "inactive", lastSeenLabel: "hace 5 días" },
    },
    {
      id: "u-invite-1",
      email: "nueva.recepcion@gmail.com",
      fullName: null,
      initials: "",
      role: "reception",
      status: { kind: "pending-invite", expiresInDays: 6 },
    },
  ];
}

export type RoleOption = {
  key: StaffRole;
  title: string;
  subtitle: string;
  bullets: string[];
  footer?: { text: string; tone: "warning" | "muted" };
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "owner",
    title: "Owner",
    subtitle: "propietario",
    bullets: [
      "Gestiona todo en la propiedad",
      "Configura precios, integraciones, staff",
      "Ve ingresos y puede hacer reembolsos",
    ],
    footer: { text: "Otorga acceso total", tone: "warning" },
  },
  {
    key: "manager",
    title: "Manager",
    subtitle: "gerente",
    bullets: [
      "Gestiona reservas y precios",
      "Ve ingresos y reportes",
      "Puede invitar staff de recepción",
    ],
  },
  {
    key: "reception",
    title: "Reception",
    subtitle: "recepción",
    bullets: [
      "Crea y modifica reservas",
      "Confirma pagos manuales",
      "Se comunica con huéspedes",
    ],
    footer: { text: "No ve precios ni ingresos", tone: "muted" },
  },
];
