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
