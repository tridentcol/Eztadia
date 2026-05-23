export type BookingStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "no-show";

export type BookingOrigin = "direct" | "booking" | "airbnb" | "manual";

export type BookingPayState =
  | "approved"
  | "waiting-receipt"
  | "rejected"
  | "refunded";

export type BookingRow = {
  code: string;
  guest: {
    name: string;
    initials: string;
    photo?: string;
  };
  roomNumber: string;
  roomType: string;
  checkIn: { iso: string; dayLabelLong: string; dayLabelShort: string };
  checkOut: { iso: string; dayLabelLong: string; dayLabelShort: string };
  totalCOP: number;
  status: BookingStatus;
  origin: BookingOrigin;
};

export type WhatsAppMessage = {
  direction: "in" | "out";
  body: string;
  ageLabel: string;
  at: string;
  party: string;
};

export type HistoryEvent = {
  title: string;
  at: string;
  meta?: string;
  tone?: "default" | "muted" | "future";
};

export type BookingDetail = BookingRow & {
  /** Id real del booking en DB (post-B6) — opcional para mantener back-compat
   * con el demo data flat. Si presente, el drawer puede disparar actions. */
  bookingId?: string;
  /** Id del payment asociado (waiting-receipt) — para confirmManualPaymentAction. */
  paymentId?: string;
  guestInfo: {
    document: string;
    documentType: "CC" | "CE" | "Pasaporte" | "NIT";
    email: string;
    phone: string;
    country: string;
    countryCode: "CO" | "US" | "GB" | "ES" | "MX";
    note?: string;
  };
  stay: {
    nights: number;
    adults: number;
    children: number;
    floor: number;
    checkInTime: string;
    checkOutTime: string;
  };
  payment: {
    method: string;
    state: BookingPayState;
    ref?: string;
    paidAt?: string;
    receipt?: { filename: string };
  };
  cancellation?: {
    at: string;
    reason: string;
  };
  messages: WhatsAppMessage[];
  history: HistoryEvent[];
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "Confirmada",
  pending: "Pago pendiente",
  completed: "Completada",
  cancelled: "Cancelada",
  "no-show": "No show",
};

export const ORIGIN_LABEL: Record<BookingOrigin, string> = {
  direct: "Directo",
  booking: "Booking",
  airbnb: "Airbnb",
  manual: "Manual",
};

const ALL_ROWS: BookingRow[] = [
  {
    code: "EZT-2026-00131",
    guest: { name: "Andrea Mendoza", initials: "AM" },
    roomNumber: "101",
    roomType: "Suite Marina",
    checkIn: { iso: "2026-05-15", dayLabelLong: "viernes", dayLabelShort: "15 may" },
    checkOut: { iso: "2026-05-18", dayLabelLong: "lunes", dayLabelShort: "18 may" },
    totalCOP: 1_350_000,
    status: "confirmed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00130",
    guest: { name: "Luis Pérez", initials: "LP" },
    roomNumber: "203",
    roomType: "Hab. Tropical",
    checkIn: { iso: "2026-05-18", dayLabelLong: "lunes", dayLabelShort: "18 may" },
    checkOut: { iso: "2026-05-21", dayLabelLong: "jueves", dayLabelShort: "21 may" },
    totalCOP: 960_000,
    status: "pending",
    origin: "direct",
  },
  {
    code: "EZT-2026-00129",
    guest: {
      name: "Familia Rodríguez",
      initials: "FR",
      photo:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80",
    },
    roomNumber: "202",
    roomType: "Hab. Tropical",
    checkIn: { iso: "2026-05-21", dayLabelLong: "hoy", dayLabelShort: "21 may" },
    checkOut: { iso: "2026-05-24", dayLabelLong: "domingo", dayLabelShort: "24 may" },
    totalCOP: 960_000,
    status: "confirmed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00128",
    guest: { name: "Tom Bradley", initials: "TB" },
    roomNumber: "301",
    roomType: "Hab. Estándar",
    checkIn: { iso: "2026-05-23", dayLabelLong: "sábado", dayLabelShort: "23 may" },
    checkOut: { iso: "2026-05-27", dayLabelLong: "miércoles", dayLabelShort: "27 may" },
    totalCOP: 880_000,
    status: "confirmed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00127",
    guest: { name: "Lucía Cárdenas", initials: "LC" },
    roomNumber: "102",
    roomType: "Suite Marina",
    checkIn: { iso: "2026-05-12", dayLabelLong: "martes", dayLabelShort: "12 may" },
    checkOut: { iso: "2026-05-15", dayLabelLong: "viernes", dayLabelShort: "15 may" },
    totalCOP: 1_350_000,
    status: "completed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00126",
    guest: { name: "M. González", initials: "MG" },
    roomNumber: "205",
    roomType: "Hab. Tropical",
    checkIn: { iso: "2026-05-23", dayLabelLong: "sábado", dayLabelShort: "23 may" },
    checkOut: { iso: "2026-05-27", dayLabelLong: "miércoles", dayLabelShort: "27 may" },
    totalCOP: 1_280_000,
    status: "confirmed",
    origin: "booking",
  },
  {
    code: "EZT-2026-00125",
    guest: { name: "Erika Pacheco", initials: "EP" },
    roomNumber: "202",
    roomType: "Hab. Tropical",
    checkIn: { iso: "2026-05-14", dayLabelLong: "jueves", dayLabelShort: "14 may" },
    checkOut: { iso: "2026-05-16", dayLabelLong: "sábado", dayLabelShort: "16 may" },
    totalCOP: 640_000,
    status: "completed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00124",
    guest: { name: "J. Smith", initials: "JS" },
    roomNumber: "205",
    roomType: "Hab. Tropical",
    checkIn: { iso: "2026-05-07", dayLabelLong: "jueves", dayLabelShort: "7 may" },
    checkOut: { iso: "2026-05-10", dayLabelLong: "domingo", dayLabelShort: "10 may" },
    totalCOP: 960_000,
    status: "completed",
    origin: "airbnb",
  },
  {
    code: "EZT-2026-00123",
    guest: { name: "Carla Vélez", initials: "CV" },
    roomNumber: "101",
    roomType: "Suite Marina",
    checkIn: { iso: "2026-05-01", dayLabelLong: "viernes", dayLabelShort: "1 may" },
    checkOut: { iso: "2026-05-04", dayLabelLong: "lunes", dayLabelShort: "4 may" },
    totalCOP: 1_350_000,
    status: "completed",
    origin: "direct",
  },
  {
    code: "EZT-2026-00122",
    guest: { name: "J. Rodríguez", initials: "JR" },
    roomNumber: "101",
    roomType: "Suite Marina",
    checkIn: { iso: "2026-05-08", dayLabelLong: "viernes", dayLabelShort: "8 may" },
    checkOut: { iso: "2026-05-11", dayLabelLong: "lunes", dayLabelShort: "11 may" },
    totalCOP: 1_350_000,
    status: "no-show",
    origin: "direct",
  },
];

const DETAILS: Record<string, BookingDetail> = {
  "EZT-2026-00131": {
    ...ALL_ROWS[0],
    guestInfo: {
      document: "1.024.567.890",
      documentType: "CC",
      email: "andrea.m@gmail.com",
      phone: "+57 311 234 5678",
      country: "Colombia",
      countryCode: "CO",
      note: "Primera vez con nosotros",
    },
    stay: {
      nights: 3,
      adults: 2,
      children: 0,
      floor: 1,
      checkInTime: "15:00",
      checkOutTime: "12:00",
    },
    payment: {
      method: "PSE vía Wompi",
      state: "approved",
      ref: "TXN_3KdSnJ4kfL2",
      paidAt: "5 may 2026, 18:34",
    },
    messages: [
      {
        direction: "out",
        body: "Listo Andrea, te esperamos el 15 de mayo. Aquí van los datos para el check-in y el wifi.",
        ageLabel: "hace 16 días",
        at: "5 may, 18:35",
        party: "Casa Marina",
      },
      {
        direction: "in",
        body: "Perfecto, llegamos sobre las 4 de la tarde. ¡Gracias!",
        ageLabel: "hace 16 días",
        at: "5 may, 19:02",
        party: "Andrea",
      },
      {
        direction: "out",
        body: "Hola Andrea, recordatorio amable de que mañana las esperamos en Casa Marina. ¿Necesitan indicaciones desde el aeropuerto?",
        ageLabel: "hace 7 días",
        at: "14 may, 09:00",
        party: "Casa Marina",
      },
    ],
    history: [
      {
        title: "Recordatorio pre check-in enviado",
        at: "21 may, 09:00",
        meta: "WhatsApp automático",
      },
      {
        title: "WhatsApp de confirmación enviado",
        at: "5 may, 18:35",
        meta: "automático",
      },
      {
        title: "Email de confirmación enviado",
        at: "5 may, 18:35",
        meta: "automático",
      },
      {
        title: "Pago confirmado",
        at: "5 may, 18:34",
        meta: "Wompi webhook",
      },
      {
        title: "Reserva creada",
        at: "5 may, 18:32",
        meta: "web pública (/p/casa-marina)",
        tone: "muted",
      },
    ],
  },
  "EZT-2026-00130": {
    ...ALL_ROWS[1],
    guestInfo: {
      document: "80.123.456",
      documentType: "CC",
      email: "luis.perez@gmail.com",
      phone: "+57 318 555 1212",
      country: "Colombia",
      countryCode: "CO",
    },
    stay: {
      nights: 3,
      adults: 2,
      children: 0,
      floor: 2,
      checkInTime: "15:00",
      checkOutTime: "12:00",
    },
    payment: {
      method: "Transferencia bancaria",
      state: "waiting-receipt",
      receipt: { filename: "comprobante.pdf" },
    },
    messages: [
      {
        direction: "out",
        body: "Hola Luis, te envío los datos para la transferencia bancaria. Cuando puedas, mándanos el comprobante por aquí.",
        ageLabel: "hace 3 días",
        at: "19 may, 14:00",
        party: "Casa Marina",
      },
      {
        direction: "in",
        body: "Hecho. Adjunto comprobante.",
        ageLabel: "hace 1 día",
        at: "21 may, 10:20",
        party: "Luis",
      },
    ],
    history: [
      {
        title: "Esperando confirmación de comprobante",
        at: "hace 4 horas",
        meta: "acción pendiente",
        tone: "future",
      },
      {
        title: "Comprobante recibido por WhatsApp",
        at: "21 may, 10:20",
        meta: "adjunto PDF",
      },
      {
        title: "Datos bancarios enviados al huésped",
        at: "19 may, 14:00",
        meta: "WhatsApp manual",
      },
      {
        title: "Reserva creada",
        at: "19 may, 13:48",
        meta: "web pública",
        tone: "muted",
      },
    ],
  },
};

export function getBookings(): BookingRow[] {
  return ALL_ROWS;
}

export function getBookingDetail(code: string): BookingDetail | null {
  return DETAILS[code] ?? null;
}

export function totalForMonth(): { total: number; confirmed: number; pending: number } {
  return { total: 32, confirmed: 14, pending: 2 };
}
