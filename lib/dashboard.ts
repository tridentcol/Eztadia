// Tipos + helpers de presentación del dashboard. El data layer real vive en
// `lib/db/queries/dashboard.ts` (pulse, attention, upcoming) y se compone en
// `app/dashboard/page.tsx`.

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
      guestPhone?: string;      // E.164 sin "+", para construir wa.me link
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
