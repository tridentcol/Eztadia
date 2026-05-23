import { z } from "zod";
import { uuid } from "./common";

/* ─── WhatsApp ─── */

export const saveWhatsAppSchema = z.object({
  propertyId: uuid,
  businessAccountId: z
    .string()
    .min(8, "Business Account ID requerido.")
    .max(64),
  phoneNumberId: z
    .string()
    .min(8, "Phone Number ID requerido.")
    .max(64),
  // Opcional al editar — si el user no re-pega, no cambia
  accessToken: z
    .string()
    .min(20, "Token muy corto.")
    .max(2048)
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export const removeWhatsAppSchema = z.object({
  propertyId: uuid,
});

/* ─── iCal ─── */

const httpsUrl = z
  .string()
  .url("URL inválida.")
  .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
    message: "Debe ser una URL http(s).",
  });

export const createIcalFeedSchema = z.object({
  propertyId: uuid,
  name: z.string().min(2, "Nombre requerido.").max(80),
  url: httpsUrl,
  direction: z.enum(["inbound", "outbound"]),
  roomId: uuid.nullable(),
  isActive: z.boolean(),
});

export const updateIcalFeedSchema = z.object({
  feedId: uuid,
  name: z.string().min(2).max(80).optional(),
  url: httpsUrl.optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
  roomId: uuid.nullable().optional(),
  isActive: z.boolean().optional(),
});

export const deleteIcalFeedSchema = z.object({
  feedId: uuid,
});

export const regenerateIcalSecretSchema = z.object({
  propertyId: uuid,
});
