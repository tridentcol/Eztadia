import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import {
  NOTIFICATION_EVENTS,
  type OwnerProfile,
  type LanguageValues,
  type NotificationPrefs,
  type NotificationEventKey,
} from "@/lib/personal-settings";

/**
 * Lee el perfil del usuario actual desde la BD y lo mapea al shape
 * `OwnerProfile` que consume PersonalSettings. Reemplaza el demo
 * `getPersonalSettings().profile` que devolvia datos fake hardcoded.
 *
 * Campos no presentes en schema profiles (bio, backupCodes, lastLogin):
 *   - bio: por ahora vacio. Si lo agregamos, requiere migration.
 *   - backupCodes: feature de SecurityTab, no Profile. 0/0 default.
 *   - lastLoginLabel: viene de auth.users.last_sign_in_at (admin client).
 *     Por ahora "—". Lo wireamos cuando agreguemos un getter admin.
 */
export async function getOwnerProfileForSettings(): Promise<OwnerProfile> {
  const profile = await requireProfile();

  return {
    fullName: profile.full_name ?? "",
    email: profile.email,
    initials: initialsFrom(profile.full_name, profile.email),
    phone: profile.phone ?? "",
    bio: "",
    role: mapRole(profile.role),
    accountId: profile.id,
    createdAtLabel: formatLongDate(profile.created_at),
    lastLoginLabel: "—",
    twoFactorEnabled: profile.totp_enabled,
    backupCodesAvailable: 0,
    backupCodesUsed: 0,
  };
}

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

/**
 * Lee preferencias de notificaciones desde profiles.notification_prefs
 * (jsonb). Sanitiza con DEFAULT_PREFS — completa eventos o channels
 * faltantes y descarta keys desconocidas. Esto evita romper la UI si
 * el shape evoluciona (por ej. nuevo evento sin migrar prefs existentes).
 */
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("notification_prefs")
    .eq("id", profile.id)
    .maybeSingle();

  const raw = data?.notification_prefs;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return DEFAULT_PREFS;
  }
  const stored = raw as Record<string, unknown>;

  // Merge stored over defaults, manteniendo solo eventos conocidos.
  const result = {} as NotificationPrefs;
  for (const ev of NOTIFICATION_EVENTS) {
    const evKey = ev.key as NotificationEventKey;
    const storedEv = stored[evKey];
    const isObj = storedEv && typeof storedEv === "object" && !Array.isArray(storedEv);
    const storedEvObj = isObj ? (storedEv as Record<string, unknown>) : {};
    result[evKey] = {
      email: typeof storedEvObj.email === "boolean" ? storedEvObj.email : DEFAULT_PREFS[evKey].email,
      whatsapp: typeof storedEvObj.whatsapp === "boolean" ? storedEvObj.whatsapp : DEFAULT_PREFS[evKey].whatsapp,
      inapp: typeof storedEvObj.inapp === "boolean" ? storedEvObj.inapp : DEFAULT_PREFS[evKey].inapp,
    };
  }
  return result;
}

/**
 * Lee las preferencias de idioma + formato del user actual. Si los
 * valores en DB son strings no validos (no deberia pasar — CHECK
 * constraint los enfuerza), retorna defaults.
 */
export async function getLanguagePrefs(): Promise<LanguageValues> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("locale, date_format, number_format")
    .eq("id", profile.id)
    .maybeSingle();

  const lang = data?.locale === "en" ? "en" : "es";
  const df = data?.date_format;
  const nf = data?.number_format;

  return {
    language: lang,
    dateFormat: df === "mdy" || df === "iso" ? df : "dmy",
    numberFormat: nf === "dot-decimal" ? "dot-decimal" : "comma-decimal",
    // Timezone no persiste por user — default a Bogota.
    timezone: "America/Bogota",
  };
}

/**
 * Mapea UserRole (global de la cuenta) al subset que muestra el pill del
 * perfil. super_admin se muestra como owner.
 */
function mapRole(
  r: "super_admin" | "owner" | "staff_manager" | "staff_reception" | "guest",
): "owner" | "manager" | "reception" {
  if (r === "owner" || r === "super_admin") return "owner";
  if (r === "staff_manager") return "manager";
  return "reception";
}

function initialsFrom(name: string | null, email: string): string {
  const src = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}
