// TODO(B6 incremental): este modulo sigue siendo demo data para
// AttentionList, WeekPulse, UpcomingCheckIns. Migrar a lib/db/queries cuando
// haya bookings/payments reales para mostrar. Por ahora dashboard/page.tsx
// solo sobrescribe owner+property con data real; el resto es demo.

export type AttentionItem =
  | {
      kind: "payment-pending";
      id: string;
      guestName: string;
      guestInitials: string;
      room: string;
      stayLabel: string;        // "15–18 may"
      totalCOP: number;
      ageLabel: string;         // "hace 2 horas"
    }
  | {
      kind: "checkin-today";
      id: string;
      guestName: string;
      guestPhoto?: string;
      guestInitials: string;
      room: string;
      partyLabel: string;       // "3 personas"
      checkInTimeLabel: string; // "17:00"
      hoursAway: number;        // 2
    }
  | {
      kind: "whatsapp-pending";
      id: string;
      guestName: string;
      guestNote?: string;       // "huésped potencial"
      guestInitials: string;
      quote: string;            // '"¿Tienen disponibilidad..."'
      ageLabel: string;         // "hace 18 min"
    };

export type WeekMetric =
  | {
      kind: "occupancy";
      label: "Ocupación";
      value: number;            // 0..100
      changeLabel: string;      // "↑ 8% vs sem. pasada"
      tone: "up" | "down";
    }
  | {
      kind: "bookings";
      label: "Reservas confirmadas";
      value: number;
      breakdown: string;        // "12 directas · 2 de Booking"
    }
  | {
      kind: "revenue";
      label: "Ingresos confirmados";
      valueCOP: number;
      footnote: string;
    }
  | {
      kind: "response-time";
      label: "Tiempo de respuesta promedio";
      valueLabel: string;       // "23 min"
      qualityLabel: string;     // "↓ excelente"
    };

export type CheckIn = {
  id: string;
  guest: string | null;         // null => bloqueada
  room: string;                 // "Hab. Tropical"
  roomNumber: string;           // "202"
  arrival: { dayLabel: string; isoDate: string; time?: string };
  departure: { dayLabel: string; isoDate: string };
  status: "confirmed" | "payment-pending" | "blocked";
  statusLabel: string;
  blockedBy?: string;
};

export type OwnerSnapshot = {
  owner: { firstName: string; fullName: string; initials: string; email: string };
  property: {
    slug: string;
    name: string;
    city: string;
    photo: string;
  };
  // Today's date is provided by the caller (server reads at request time)
  attention: AttentionItem[];
  pulse: WeekMetric[];
  upcoming: CheckIn[];
  unreadMessages: number;
};

export const DEMO_SNAPSHOT: OwnerSnapshot = {
  owner: {
    firstName: "Carlos",
    fullName: "Carlos San Juan",
    initials: "CS",
    email: "carlossanjuan2113@gmail.com",
  },
  property: {
    slug: "casa-marina",
    name: "Casa Marina",
    city: "Cartagena",
    photo: "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?auto=format&fit=crop&w=160&q=80",
  },
  unreadMessages: 3,
  attention: [
    {
      kind: "payment-pending",
      id: "att-1",
      guestName: "Andrea Mendoza",
      guestInitials: "AM",
      room: "Suite Marina",
      stayLabel: "15–18 may",
      totalCOP: 1_350_000,
      ageLabel: "hace 2 horas",
    },
    {
      kind: "checkin-today",
      id: "att-2",
      guestName: "Familia Rodríguez",
      guestPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80",
      guestInitials: "FR",
      room: "Habitación Tropical",
      partyLabel: "3 personas",
      checkInTimeLabel: "17:00",
      hoursAway: 2,
    },
    {
      kind: "whatsapp-pending",
      id: "att-3",
      guestName: "María Salazar",
      guestNote: "huésped potencial",
      guestInitials: "MS",
      quote: "“¿Tienen disponibilidad para 2 personas del 28 al 30 de mayo?”",
      ageLabel: "hace 18 min",
    },
  ],
  pulse: [
    { kind: "occupancy", label: "Ocupación", value: 67, changeLabel: "↑ 8% vs sem. pasada", tone: "up" },
    { kind: "bookings", label: "Reservas confirmadas", value: 14, breakdown: "12 directas · 2 de Booking" },
    { kind: "revenue", label: "Ingresos confirmados", valueCOP: 5_480_000, footnote: "COP · solo pagos confirmados" },
    { kind: "response-time", label: "Tiempo de respuesta promedio", valueLabel: "23 min", qualityLabel: "↓ excelente" },
  ],
  upcoming: [
    {
      id: "bk-1",
      guest: "Familia Rodríguez",
      room: "Hab. Tropical",
      roomNumber: "202",
      arrival: { dayLabel: "Hoy", isoDate: "2026-05-21", time: "17:00" },
      departure: { dayLabel: "Lun", isoDate: "2026-05-24" },
      status: "confirmed",
      statusLabel: "Confirmada",
    },
    {
      id: "bk-2",
      guest: "Andrea Mendoza",
      room: "Suite Marina",
      roomNumber: "101",
      arrival: { dayLabel: "Mañana", isoDate: "2026-05-22" },
      departure: { dayLabel: "Dom", isoDate: "2026-05-25" },
      status: "payment-pending",
      statusLabel: "Pago pendiente",
    },
    {
      id: "bk-3",
      guest: "Tom Bradley",
      room: "Hab. Estándar",
      roomNumber: "301",
      arrival: { dayLabel: "Dom", isoDate: "2026-05-23" },
      departure: { dayLabel: "Mié", isoDate: "2026-05-27" },
      status: "confirmed",
      statusLabel: "Confirmada",
    },
    {
      id: "bk-4",
      guest: "Lucía Cárdenas",
      room: "Suite Marina",
      roomNumber: "102",
      arrival: { dayLabel: "Lun", isoDate: "2026-05-24" },
      departure: { dayLabel: "Sáb", isoDate: "2026-05-30" },
      status: "confirmed",
      statusLabel: "Confirmada",
    },
    {
      id: "bk-5",
      guest: null,
      room: "Hab. Tropical",
      roomNumber: "203",
      arrival: { dayLabel: "Mar", isoDate: "2026-05-25" },
      departure: { dayLabel: "Vie", isoDate: "2026-05-28" },
      status: "blocked",
      statusLabel: "Bloqueada (Booking.com)",
      blockedBy: "Booking.com",
    },
  ],
};

export function getOwnerSnapshot(): OwnerSnapshot {
  return DEMO_SNAPSHOT;
}

const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function greetingFor(date: Date): { phrase: string; longDate: string } {
  const h = date.getHours();
  let phrase: string;
  if (h < 12) phrase = "Buenos días";
  else if (h < 19) phrase = "Buenas tardes";
  else phrase = "Buenas noches";
  const longDate = `${DAYS_ES[date.getDay()]} ${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
  return { phrase, longDate };
}

/** For the subtitle: build the "tienes X cosas pendientes y un check-in en Y horas" line. */
export function subtitleFor(snapshot: OwnerSnapshot): string {
  const today = snapshot.attention.find((a) => a.kind === "checkin-today");
  const others = snapshot.attention.filter((a) => a.kind !== "checkin-today").length;
  if (!today && others === 0) {
    return "Sin pendientes. Buen momento para revisar el calendario.";
  }
  const parts: string[] = [];
  if (others > 0) parts.push(`Tienes ${others === 1 ? "1 cosa pendiente" : `${others} cosas pendientes`}`);
  if (today && today.kind === "checkin-today") {
    const hour = today.hoursAway;
    parts.push(`un check-in en ${hour === 1 ? "1 hora" : `${hour} horas`}`);
  }
  return parts.join(" y ") + ".";
}
