import { z } from "zod";
import { uuid, moneyCents, isoDate, phoneE164, email, fullName } from "./common";

const paymentMethod = z.enum(["pse", "manual_transfer", "external", "admin_override"]);

export const createHoldSchema = z
  .object({
    propertyId: uuid,
    roomTypeId: uuid,
    checkIn: isoDate,
    checkOut: isoDate,
    guestEmail: email,
    guestPhone: phoneE164,
    totalCents: moneyCents,
    paymentMethod,
    // TTL deciden el server action (pse=15min, manual=24h). Si viene del
    // cliente, lo permitimos pero el server puede sobreescribir.
    ttlMinutes: z.number().int().min(5).max(2880).optional(),
  })
  .refine((v) => v.checkIn < v.checkOut, {
    path: ["checkOut"],
    message: "La salida debe ser despues de la entrada.",
  });

export const confirmBookingSchema = z.object({
  bookingId: uuid,
  roomId: uuid.optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: uuid,
  reason: z.string().max(500).optional(),
});

export const assignRoomSchema = z.object({
  bookingId: uuid,
  roomId: uuid,
});

/**
 * Reserva manual ingresada por staff desde el dashboard. No pasa por hold —
 * crea booking directo con status=`confirmed`. Para registrar una reserva
 * que ya está cerrada (e.g. teléfono, walk-in, OTA fuera de iCal).
 */
export const createManualBookingSchema = z
  .object({
    propertyId: uuid,
    roomTypeId: uuid,
    roomId: uuid.optional(),
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.number().int().min(1).max(10),
    children: z.number().int().min(0).max(10).default(0),
    guestFullName: fullName,
    guestEmail: email,
    guestPhone: phoneE164,
    guestDocumentType: z.enum(["CC", "CE", "passport"]).optional(),
    guestDocumentNumber: z.string().max(40).optional(),
    totalCents: moneyCents,
    paymentMethod: z.enum(["manual_transfer", "external", "admin_override"]),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => v.checkIn < v.checkOut, {
    path: ["checkOut"],
    message: "La salida debe ser despues de la entrada.",
  });

export const publicBookingSubmitSchema = z
  .object({
    propertyId: uuid,
    roomTypeId: uuid,
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.number().int().min(1).max(10),
    children: z.number().int().min(0).max(10).default(0),
    guestFullName: fullName,
    guestEmail: email,
    guestPhone: phoneE164,
    guestDocumentType: z.enum(["CC", "CE", "passport"]).optional(),
    guestDocumentNumber: z.string().max(40).optional(),
    paymentMethod: z.enum(["pse", "manual_transfer"]),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar terminos." }) }),
  })
  .refine((v) => v.checkIn < v.checkOut, {
    path: ["checkOut"],
    message: "La salida debe ser despues de la entrada.",
  });

export type CreateHoldInput            = z.infer<typeof createHoldSchema>;
export type ConfirmBookingInput        = z.infer<typeof confirmBookingSchema>;
export type CancelBookingInput         = z.infer<typeof cancelBookingSchema>;
export type AssignRoomInput            = z.infer<typeof assignRoomSchema>;
export type CreateManualBookingInput   = z.infer<typeof createManualBookingSchema>;
export type PublicBookingSubmitInput   = z.infer<typeof publicBookingSubmitSchema>;
