export type IntegrationStatus = "connected" | "partial" | "disconnected";

export type IcalFeed = {
  id: string;
  source: "booking" | "airbnb" | "other";
  label: string;
  lastSyncedAgo: string;
};

export type Integrations = {
  wompi: {
    status: IntegrationStatus;
    mode: "sandbox" | "production";
    connectedAtLabel: string;
    commissionLabel: string;
    features: string[];
  };
  whatsapp: {
    status: IntegrationStatus;
    phone: string;
    templatesApproved: number;
    templatesTotal: number;
    monthlyUsed: number;
    monthlyFreeCap: number;
  };
  ical: {
    status: IntegrationStatus;
    syncEveryMinutes: number;
    incoming: IcalFeed[];
    outgoingUrl: string;
  };
};

export function getIntegrations(): Integrations {
  return {
    wompi: {
      status: "connected",
      mode: "production",
      connectedAtLabel: "5 mar 2026",
      commissionLabel: "2,99% + IVA por transacción aprobada",
      features: ["PSE Persona Natural", "PSE Empresarial", "Bancolombia Transfer"],
    },
    whatsapp: {
      status: "connected",
      phone: "+57 311 222 3344",
      templatesApproved: 5,
      templatesTotal: 5,
      monthlyUsed: 327,
      monthlyFreeCap: 1000,
    },
    ical: {
      status: "partial",
      syncEveryMinutes: 15,
      incoming: [
        { id: "f1", source: "booking", label: "Booking.com — Suite 101", lastSyncedAgo: "hace 8 min" },
        { id: "f2", source: "airbnb", label: "Airbnb — Hab. Tropical", lastSyncedAgo: "hace 8 min" },
      ],
      outgoingUrl: "https://eztadia.com/api/ical/casa-marina/xxx.ics",
    },
  };
}

export type ComingSoonIntegration = {
  key: string;
  title: string;
  description: string;
};

export const COMING_SOON: ComingSoonIntegration[] = [
  {
    key: "stripe",
    title: "Stripe",
    description:
      "Pagos internacionales con tarjeta de crédito para huéspedes desde el exterior.",
  },
  {
    key: "mailchimp",
    title: "Mailchimp",
    description:
      "Email marketing automatizado a huéspedes pasados — newsletters, ofertas, fidelización.",
  },
  {
    key: "channel-manager",
    title: "Channel Manager API",
    description:
      "Booking + Expedia integración directa. Sin necesidad de iCal — sync bidireccional en tiempo real.",
  },
];
