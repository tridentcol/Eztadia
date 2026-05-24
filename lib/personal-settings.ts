import { z } from "zod";

export const PERSONAL_SETTINGS_TABS = [
  { key: "profile", label: "Perfil" },
  { key: "security", label: "Seguridad" },
  { key: "sessions", label: "Sesiones activas" },
  { key: "notifications", label: "Notificaciones" },
  { key: "language", label: "Idioma y región" },
  { key: "billing", label: "Plan y facturación" },
] as const;

export type PersonalSettingsTabKey = (typeof PERSONAL_SETTINGS_TABS)[number]["key"];

/* ─── PROFILE ─── */
export const profileSchema = z.object({
  fullName: z.string().min(2, "Tu nombre, por favor."),
  phonePrefix: z.string().default("+57"),
  phone: z.string().max(30).optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;

/* ─── PASSWORD ─── */
export const passwordSchema = z
  .object({
    current: z.string().min(1, "Tu contraseña actual."),
    next: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
        message: "Mezcla letras y números.",
      }),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden.",
  });
export type PasswordValues = z.infer<typeof passwordSchema>;

/* ─── NOTIFICATIONS ─── */
export const NOTIFICATION_EVENTS = [
  {
    key: "booking-confirmed",
    title: "Nueva reserva confirmada",
    subtitle: "Cuando un huésped completa el pago y la reserva queda confirmada.",
  },
  {
    key: "booking-pending",
    title: "Reserva pendiente de pago (manual)",
    subtitle: "Cuando un huésped sube comprobante de transferencia para tu revisión.",
  },
  {
    key: "checkin-today",
    title: "Check-in hoy",
    subtitle: "Recordatorio matutino de quién llega hoy.",
  },
  {
    key: "checkout-today",
    title: "Check-out hoy",
    subtitle: "Recordatorio matutino de quién se va hoy.",
  },
  {
    key: "guest-message",
    title: "Mensaje nuevo de huésped",
    subtitle: "Cuando alguien te escribe por WhatsApp o el chat interno.",
  },
  {
    key: "cancellation",
    title: "Cancelación de reserva",
    subtitle: "Cuando un huésped cancela su reserva o caduca un hold.",
  },
  {
    key: "webhook-error",
    title: "Error en webhook de pago",
    subtitle: "Si Wompi tiene un fallo procesando un pago.",
  },
  {
    key: "weekly-summary",
    title: "Resumen semanal",
    subtitle: "Cada lunes en la mañana, tus números de la semana anterior.",
  },
  {
    key: "product-news",
    title: "Producto: novedades de Eztadia",
    subtitle: "Una vez al mes o menos. Sin spam.",
  },
] as const;

export type NotificationChannel = "email" | "whatsapp" | "inapp";
export type NotificationEventKey = (typeof NOTIFICATION_EVENTS)[number]["key"];

export type NotificationPrefs = Record<
  NotificationEventKey,
  Record<NotificationChannel, boolean>
>;

const DEFAULT_PREFS: NotificationPrefs = {
  "booking-confirmed": { email: true, whatsapp: true, inapp: true },
  "booking-pending": { email: true, whatsapp: true, inapp: true },
  "checkin-today": { email: false, whatsapp: true, inapp: true },
  "checkout-today": { email: false, whatsapp: false, inapp: true },
  "guest-message": { email: false, whatsapp: true, inapp: true },
  cancellation: { email: true, whatsapp: true, inapp: true },
  "webhook-error": { email: true, whatsapp: false, inapp: true },
  "weekly-summary": { email: true, whatsapp: false, inapp: false },
  "product-news": { email: true, whatsapp: false, inapp: false },
};

/* ─── LANGUAGE ─── */
export type Language = "es" | "en";
export type DateFormat = "dmy" | "mdy" | "iso";
export type NumberFormat = "comma-decimal" | "dot-decimal";

export const languageSchema = z.object({
  language: z.enum(["es", "en"]),
  dateFormat: z.enum(["dmy", "mdy", "iso"]),
  numberFormat: z.enum(["comma-decimal", "dot-decimal"]),
  timezone: z.string(),
});
export type LanguageValues = z.infer<typeof languageSchema>;

/* ─── SESSIONS ─── */
export type DeviceKind = "desktop" | "mobile" | "browser";

export type ActiveSession = {
  id: string;
  device: DeviceKind;
  label: string; // "Mac · Safari"
  location: string;
  ip: string;
  lastActiveLabel: string;
  isCurrent: boolean;
};

/* ─── DEMO SNAPSHOT ─── */

export type OwnerProfile = {
  fullName: string;
  email: string;
  initials: string;
  phone: string;
  /** Sin columna en BD aun — siempre "" desde getOwnerProfileForSettings.
   *  Si lo agregamos, requiere migration profiles.bio. */
  bio: string;
  role: "owner" | "manager" | "reception";
  accountId: string;
  createdAtLabel: string;
  lastLoginLabel: string;
  twoFactorEnabled: boolean;
  backupCodesAvailable: number;
  backupCodesUsed: number;
};

export type PersonalSettings = {
  profile: OwnerProfile;
  notificationPrefs: NotificationPrefs;
  language: LanguageValues;
  sessions: ActiveSession[];
};

export function getPersonalSettings(): PersonalSettings {
  return {
    profile: {
      fullName: "Carlos San Juan",
      email: "carlos@casamarina.co",
      initials: "CSJ",
      phone: "311 222 3344",
      bio: "Hospedando con calma desde Casa Marina, en el centro histórico de Cartagena.",
      role: "owner",
      accountId: "usr_3KdSn4xJ2HpL",
      createdAtLabel: "5 marzo 2026",
      lastLoginLabel: "Hoy, 14:30",
      twoFactorEnabled: false,
      backupCodesAvailable: 0,
      backupCodesUsed: 0,
    },
    notificationPrefs: DEFAULT_PREFS,
    language: {
      language: "es",
      dateFormat: "dmy",
      numberFormat: "comma-decimal",
      timezone: "America/Bogota",
    },
    sessions: [
      {
        id: "s1",
        device: "desktop",
        label: "Mac · Safari",
        location: "Bogotá, Colombia",
        ip: "190.85.x.x",
        lastActiveLabel: "Activo ahora",
        isCurrent: true,
      },
      {
        id: "s2",
        device: "mobile",
        label: "iPhone · App",
        location: "Bogotá, Colombia",
        ip: "190.85.x.x",
        lastActiveLabel: "hace 3 horas",
        isCurrent: false,
      },
      {
        id: "s3",
        device: "browser",
        label: "Windows · Chrome",
        location: "Medellín, Colombia",
        ip: "200.20.x.x",
        lastActiveLabel: "hace 5 días",
        isCurrent: false,
      },
    ],
  };
}

export const DEMO_BACKUP_CODES = [
  "7K9F-AS3D",
  "L2HX-PN8B",
  "QR4V-WW9A",
  "M5J7-T6KP",
  "X8Z2-RR4H",
  "B3CN-9DLA",
  "V1S6-PMQ4",
  "K7HF-W2X9",
  "DJ3B-N5TC",
  "F4L8-AHM2",
];

export const DEMO_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
