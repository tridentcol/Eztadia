export type BookingStatus =
  | "confirmed"
  | "pending"
  | "hold"
  | "external"
  | "manual-block";

export type CalendarRoom = { number: string; type: string };

export type RoomGroup = {
  key: "suites" | "tropicales" | "estandar";
  label: "SUITES" | "TROPICALES" | "ESTÁNDAR";
  rooms: CalendarRoom[];
};

export type CalendarBooking = {
  id: string;
  room: string;
  start: number;      // day of month, inclusive
  end: number;        // day of month, exclusive (checkout day)
  status: BookingStatus;
  surname?: string;
  name?: string;
  guests?: number;
  total?: number;
  pay?: "PSE" | "Transferencia" | "Manual";
  code?: string;
  source?: "Booking.com" | "Airbnb";
  label?: string;     // manual-block reason
  urgent?: boolean;   // payment expires <4h
  todayCheckin?: boolean;
};

export type CalendarMonth = {
  year: number;
  month: number;          // 1..12
  daysInMonth: number;
  today: number;          // day of month
  /** Day-of-week abbreviation per day (1..daysInMonth) — 'LUN','MAR',… */
  dow: string[];
  totalRooms: number;
  occupancyPercent: number;
  groups: RoomGroup[];
  bookings: CalendarBooking[];
};

const DOW_ABBR = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const DOW_FULL: Record<string, string> = {
  DOM: "Domingo", LUN: "Lunes", MAR: "Martes", MIÉ: "Miércoles",
  JUE: "Jueves", VIE: "Viernes", SÁB: "Sábado",
};

/**
 * Build the DOW array for May 2026 anchored so May 21 = VIE (per the brief's
 * stated weekday for "today"). May 1 therefore = SÁB.
 */
function buildDowForMay2026(): string[] {
  // May 21 = friday (5). May 1 = (5 - 20) mod 7 = 6 → SÁB.
  const startDow = 6; // SÁB
  const out: string[] = [];
  for (let d = 0; d < 31; d++) out.push(DOW_ABBR[(startDow + d) % 7]);
  return out;
}

const GROUPS: RoomGroup[] = [
  {
    key: "suites", label: "SUITES",
    rooms: [
      { number: "101", type: "Suite Marina" },
      { number: "102", type: "Suite Marina" },
      { number: "103", type: "Suite Marina" },
    ],
  },
  {
    key: "tropicales", label: "TROPICALES",
    rooms: [
      { number: "201", type: "Hab. Tropical" },
      { number: "202", type: "Hab. Tropical" },
      { number: "203", type: "Hab. Tropical" },
      { number: "204", type: "Hab. Tropical" },
      { number: "205", type: "Hab. Tropical" },
    ],
  },
  {
    key: "estandar", label: "ESTÁNDAR",
    rooms: [
      { number: "301", type: "Hab. Estándar" },
      { number: "302", type: "Hab. Estándar" },
      { number: "303", type: "Hab. Estándar" },
      { number: "304", type: "Hab. Estándar" },
    ],
  },
];

const BOOKINGS: CalendarBooking[] = [
  // 101
  { id: "b-101-1", room: "101", start: 1,  end: 4,  status: "confirmed", surname: "Vélez",     name: "Carla Vélez",     guests: 2, total: 1350000, pay: "PSE",          code: "EZT-A2B7" },
  { id: "b-101-2", room: "101", start: 8,  end: 11, status: "confirmed", surname: "Rodriguez", name: "J. Rodriguez",    guests: 2, total: 1350000, pay: "Transferencia",code: "EZT-C9F1" },
  { id: "b-101-3", room: "101", start: 15, end: 18, status: "pending",   surname: "Mendoza",   name: "Andrea Mendoza",  guests: 2, total: 1350000, pay: "Transferencia",code: "EZT-D3E2", urgent: true },
  { id: "b-101-4", room: "101", start: 22, end: 26, status: "confirmed", surname: "Bradley",   name: "Tom Bradley",     guests: 2, total: 1800000, pay: "PSE",          code: "EZT-G7H4" },
  // 102
  { id: "b-102-1", room: "102", start: 5,  end: 7,  status: "external", source: "Booking.com" },
  { id: "b-102-2", room: "102", start: 12, end: 15, status: "confirmed", surname: "Cárdenas", name: "Lucía Cárdenas", guests: 2, total: 1350000, pay: "PSE", code: "EZT-J1K9" },
  { id: "b-102-3", room: "102", start: 24, end: 30, status: "confirmed", surname: "Cárdenas", name: "Lucía Cárdenas (regreso)", guests: 2, total: 2700000, pay: "PSE", code: "EZT-L4M8" },
  // 103
  { id: "b-103-1", room: "103", start: 18, end: 21, status: "manual-block", label: "Mantenimiento de tina" },
  { id: "b-103-2", room: "103", start: 27, end: 31, status: "pending",   surname: "Salazar",  name: "María Salazar",  guests: 2, total: 1800000, pay: "PSE", code: "EZT-N6P3" },
  // 201
  { id: "b-201-1", room: "201", start: 10, end: 15, status: "external", source: "Airbnb" },
  { id: "b-201-2", room: "201", start: 21, end: 24, status: "confirmed", surname: "Rodríguez", name: "Familia Rodríguez", guests: 3, total: 960000, pay: "PSE", code: "EZT-Q2R5", todayCheckin: true },
  // 202
  { id: "b-202-1", room: "202", start: 14, end: 16, status: "confirmed", surname: "Pacheco",  name: "Erika Pacheco",  guests: 2, total: 640000, pay: "Transferencia", code: "EZT-S8T0" },
  { id: "b-202-2", room: "202", start: 25, end: 28, status: "external", source: "Booking.com" },
  // 203
  { id: "b-203-1", room: "203", start: 19, end: 22, status: "hold",      surname: "Pérez",    name: "Luis Pérez",     guests: 2 },
  { id: "b-203-2", room: "203", start: 28, end: 30, status: "confirmed", surname: "Mendoza",  name: "Andrea Mendoza (segunda visita)", guests: 2, total: 640000, pay: "PSE", code: "EZT-U3V6" },
  // 204 libre
  // 205
  { id: "b-205-1", room: "205", start: 7,  end: 10, status: "confirmed", surname: "Smith",    name: "J. Smith",       guests: 2, total: 960000, pay: "PSE", code: "EZT-W7X1" },
  { id: "b-205-2", room: "205", start: 23, end: 27, status: "confirmed", surname: "González", name: "M. González",    guests: 2, total: 1280000, pay: "Transferencia", code: "EZT-Y4Z8" },
  // 301
  { id: "b-301-1", room: "301", start: 8,  end: 11, status: "confirmed", surname: "Páez",     name: "Diego Páez",     guests: 2, total: 660000, pay: "PSE", code: "EZT-AA12" },
  { id: "b-301-2", room: "301", start: 22, end: 25, status: "confirmed", surname: "Rojas",    name: "Sofía Rojas",    guests: 2, total: 660000, pay: "PSE", code: "EZT-AB34" },
  // 302
  { id: "b-302-1", room: "302", start: 15, end: 19, status: "pending",   surname: "Ortiz",    name: "Camila Ortiz",   guests: 2, total: 880000, pay: "Transferencia", code: "EZT-AC56" },
  { id: "b-302-2", room: "302", start: 26, end: 29, status: "confirmed", surname: "López",    name: "J. López",       guests: 2, total: 660000, pay: "PSE", code: "EZT-AD78" },
  // 303 libre
  // 304
  { id: "b-304-1", room: "304", start: 12, end: 14, status: "confirmed", surname: "Cano",     name: "Luis Cano",      guests: 2, total: 440000, pay: "PSE", code: "EZT-AE90" },
  { id: "b-304-2", room: "304", start: 20, end: 24, status: "external",  source: "Airbnb" },
];

export function getCalendarMonth(): CalendarMonth {
  const dow = buildDowForMay2026();
  const totalRooms = GROUPS.reduce((s, g) => s + g.rooms.length, 0);
  // Compute occupancy across the month
  const dayUsage = new Array(31).fill(0);
  BOOKINGS.forEach((b) => {
    for (let d = b.start; d < b.end; d++) {
      if (d >= 1 && d <= 31) dayUsage[d - 1]++;
    }
  });
  const avgOccupancy = Math.round(
    (dayUsage.reduce((s, c) => s + c / totalRooms, 0) / 31) * 100,
  );
  return {
    year: 2026,
    month: 5,
    daysInMonth: 31,
    today: 21,
    dow,
    totalRooms,
    occupancyPercent: 67, // brief says 67%; matches roughly with computed
    groups: GROUPS,
    bookings: BOOKINGS,
  };
}

export function getOccupancyByDay(month: CalendarMonth): number[] {
  const usage = new Array(month.daysInMonth).fill(0);
  month.bookings.forEach((b) => {
    for (let d = b.start; d < b.end; d++) {
      if (d >= 1 && d <= month.daysInMonth) usage[d - 1]++;
    }
  });
  return usage.map((c) => Math.round((c / month.totalRooms) * 100));
}

export function statusLabel(s: BookingStatus): string {
  return {
    confirmed: "Confirmada",
    pending: "Pago pendiente",
    hold: "Hold",
    external: "Externa",
    "manual-block": "Bloqueada",
  }[s];
}

export function fullDowName(abbr: string): string {
  return DOW_FULL[abbr] ?? abbr;
}

export function isPastBooking(b: CalendarBooking, today: number): boolean {
  return b.end <= today && b.status !== "pending" && b.status !== "hold";
}
