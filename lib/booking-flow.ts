export type PaymentMethod = "pse" | "manual";

export type DocumentType = "CC" | "CE" | "PA";

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  CC: "CC · Cédula de ciudadanía",
  CE: "CE · Cédula de extranjería",
  PA: "Pasaporte",
};

export type BookingHold = {
  id: string;            // hold token, used in URL
  code: string;          // EZT-2026-00131
  property: {
    slug: string;
    name: string;
    city: string;
    photo: string;
    whatsapp: string;
    helpUrl: string;
  };
  room: {
    typeName: string;    // "Suite Marina"
    number: string;      // "101"
  };
  stay: {
    checkInIso: string;  // 2026-05-15
    checkOutIso: string; // 2026-05-18
    checkInLabel: string;
    checkOutLabel: string;
    checkInTime: string; // 15:00
    checkOutTime: string;
    nights: number;
    adults: number;
    children: number;
  };
  totalCOP: number;
  expiresAt: string;     // ISO string when hold expires
};

export type BankAccount = {
  bank: string;
  accountType: string;
  accountNumber: string;
  holder: string;
  nit: string;
};

export const CASA_MARINA_BANK: BankAccount = {
  bank: "Bancolombia",
  accountType: "Ahorros",
  accountNumber: "1234-5678-9012",
  holder: "Casa Marina S.A.S.",
  nit: "900.123.456-7",
};

/** Demo hold for Andrea Mendoza · Suite Marina · 15–18 may */
export function getDemoHold(): BookingHold {
  return {
    id: "h_1q8L2",
    code: "EZT-2026-00131",
    property: {
      slug: "casa-marina",
      name: "Casa Marina",
      city: "Cartagena",
      photo:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80",
      whatsapp: "+57 311 222 3344",
      helpUrl: "https://wa.me/573112223344",
    },
    room: { typeName: "Suite Marina", number: "101" },
    stay: {
      checkInIso: "2026-05-15",
      checkOutIso: "2026-05-18",
      checkInLabel: "15 may",
      checkOutLabel: "18 may",
      checkInTime: "15:00",
      checkOutTime: "12:00",
      nights: 3,
      adults: 2,
      children: 0,
    },
    totalCOP: 1_350_000,
    // Demo: 14m 32s from "now" — overriden in client by static counter
    expiresAt: new Date(Date.now() + 14 * 60 * 1000 + 32 * 1000).toISOString(),
  };
}

export type StatusVariant = "confirmed" | "waiting" | "failed";
