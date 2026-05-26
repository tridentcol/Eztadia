import { z } from "zod";

/**
 * Schema para updateProfileAction. Subset editable de `profiles`:
 *  - fullName: visible en greeting, emails a huespedes, facturas
 *  - phone: opcional, sin formato — el form maneja prefix +57 separado
 *
 * NO incluye email (cambio via support por ahora — politica) ni role
 * (cambio solo por admin) ni avatar_url (sube via storage en otra action).
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Tu nombre, por favor.").max(120),
  phone: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Preferencias de idioma + formato del user. Persisten en profiles
 * (locale, date_format, number_format). Timezone no persiste por user
 * por ahora — cada property tiene su propio timezone.
 */
export const updateLanguagePrefsSchema = z.object({
  language: z.enum(["es", "en"]),
  dateFormat: z.enum(["dmy", "mdy", "iso"]),
  numberFormat: z.enum(["comma-decimal", "dot-decimal"]),
});

export type UpdateLanguagePrefsInput = z.infer<typeof updateLanguagePrefsSchema>;

/**
 * Notification preferences: matriz de event × channel persistida como
 * jsonb en profiles.notification_prefs. Schema laxo (cada key es un
 * Record de booleans) para evitar migration cuando agreguemos nuevos
 * eventos o canales — sanitizado al leer con DEFAULT_PREFS como
 * fallback de claves faltantes.
 */
export const notificationPrefsSchema = z.record(
  z.string(),
  z.record(z.enum(["email", "whatsapp", "inapp"]), z.boolean()),
);

export const updateNotificationPrefsSchema = z.object({
  prefs: notificationPrefsSchema,
});

export type UpdateNotificationPrefsInput = z.infer<typeof updateNotificationPrefsSchema>;
