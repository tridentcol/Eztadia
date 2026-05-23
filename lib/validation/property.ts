import { z } from "zod";
import { uuid, slug, phoneE164 } from "./common";

export const createPropertySchema = z.object({
  organizationName: z.string().min(2, "Nombre de organizacion requerido."),
  name: z.string().min(2, "Nombre de propiedad requerido.").max(120),
  slug,
  city: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
});

// booking_policy jsonb shape — fuente de verdad para campos sin columna propia.
// Schema laxo: permite agregar keys nuevas sin migration (todas opcionales).
export const bookingPolicySchema = z
  .object({
    cancellation: z.enum(["flexible", "moderate", "strict"]).optional(),
    pets: z
      .object({
        allowed: z.boolean(),
        fee_cents: z.number().int().nonnegative().optional(),
        rules: z.string().max(280).optional(),
      })
      .optional(),
    children: z
      .object({
        allowed: z.boolean(),
        free_age_max: z.number().int().min(0).max(17).optional(),
      })
      .optional(),
    smoking: z
      .object({
        allowed: z.boolean(),
        areas: z.string().max(280).optional(),
      })
      .optional(),
    events: z.object({ allowed: z.boolean() }).optional(),
    schedules: z
      .object({
        early_check_in: z.boolean().optional(),
        late_check_out: z.boolean().optional(),
      })
      .optional(),
    advanced: z
      .object({
        show_nightly_price: z.boolean().optional(),
        instant_bookings: z.boolean().optional(),
        require_id_document: z.boolean().optional(),
        hold_ttl_pse_minutes: z.number().int().min(5).max(60).optional(),
        hold_ttl_manual_hours: z.number().int().min(1).max(72).optional(),
      })
      .optional(),
  })
  .passthrough();
export type BookingPolicy = z.infer<typeof bookingPolicySchema>;

export const updatePropertySchema = z.object({
  id: uuid,
  name: z.string().min(2).max(120).optional(),
  slug: slug.optional(),
  city: z.string().max(80).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  country: z.string().min(2).max(80).optional(),
  timezone: z.string().min(2).max(64).optional(),
  descriptionEs: z.string().max(5000).nullable().optional(),
  descriptionEn: z.string().max(5000).nullable().optional(),
  amenities: z.array(z.string().max(40)).max(40).optional(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida.").optional(),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida.").optional(),
  minStayNights: z.number().int().min(1).max(365).optional(),
  maxStayNights: z.number().int().min(1).max(365).nullable().optional(),
  isActive: z.boolean().optional(),
  contactPhone: phoneE164.nullable().optional(),
  bookingPolicy: bookingPolicySchema.optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
