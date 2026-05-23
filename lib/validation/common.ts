import { z } from "zod";

/**
 * Primitivos reutilizables para todos los schemas.
 */

export const uuid = z.string().uuid("ID invalido.");

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida (YYYY-MM-DD).");

export const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Fecha invalida.");

/** Telefono E.164 colombiano por default; flexible para internacional. */
export const phoneE164 = z
  .string()
  .regex(/^\+\d{8,15}$/, "Telefono invalido (formato +57...).");

export const slug = z
  .string()
  .min(3, "Slug muy corto (min 3).")
  .max(60, "Slug muy largo (max 60).")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Solo minusculas, numeros y guiones.");

export const moneyCents = z
  .number()
  .int("Debe ser entero (centavos).")
  .nonnegative("No puede ser negativo.")
  .max(99_999_999_99, "Excede el limite.");

export const fullName = z.string().min(3, "Tu nombre completo, por favor.").max(120);
export const email    = z.string().email("Email invalido.").max(254);
export const password = z
  .string()
  .min(8, "Minimo 8 caracteres.")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
    message: "Mezcla letras y numeros.",
  });

/** Refinement: check_in < check_out (rango valido de noches). */
export function refineDateRange<T extends { checkIn: string; checkOut: string }>(
  s: z.ZodType<T>,
): z.ZodEffects<z.ZodType<T>, T, T> {
  return s.refine((v) => v.checkIn < v.checkOut, {
    message: "La salida debe ser despues de la entrada.",
    path: ["checkOut"],
  });
}
