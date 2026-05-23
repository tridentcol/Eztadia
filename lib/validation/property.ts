import { z } from "zod";
import { uuid, slug, phoneE164 } from "./common";

export const createPropertySchema = z.object({
  organizationName: z.string().min(2, "Nombre de organizacion requerido."),
  name: z.string().min(2, "Nombre de propiedad requerido.").max(120),
  slug,
  city: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
});

export const updatePropertySchema = z.object({
  id: uuid,
  name: z.string().min(2).max(120).optional(),
  slug: slug.optional(),
  city: z.string().max(80).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  descriptionEs: z.string().max(5000).nullable().optional(),
  descriptionEn: z.string().max(5000).nullable().optional(),
  amenities: z.array(z.string().max(40)).max(40).optional(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida.").optional(),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida.").optional(),
  minStayNights: z.number().int().min(1).max(365).optional(),
  maxStayNights: z.number().int().min(1).max(365).nullable().optional(),
  isActive: z.boolean().optional(),
  contactPhone: phoneE164.nullable().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
