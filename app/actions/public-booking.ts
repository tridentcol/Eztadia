"use server";

import { publicBookingSubmitSchema } from "@/lib/validation/booking";
import { createBookingHold } from "@/lib/db/mutations/bookings";
import { getRoomTypeById } from "@/lib/db/queries/rooms";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

/**
 * Server action que el flow publico /p/[slug]/booking/new dispara.
 *
 * NO requiere auth (anon). Por eso pasa `asAdmin: true` a createBookingHold
 * — la function SQL hace el check de disponibilidad atomico.
 *
 * El hold queda activo TTL minutos (pse=15, manual_transfer=1440=24h).
 * Caller redirige a /booking/[holdId]/pay donde el guest paga o sube
 * comprobante.
 *
 * `total_cents` se computa server-side como base_price_cents * nights
 * (sin seasonal_rates por ahora — TODO C+).
 */
export async function publicCreateHoldAction(raw: unknown) {
  return run(publicBookingSubmitSchema, raw, async (input) => {
    const ttl = input.paymentMethod === "pse" ? 15 : 60 * 24;
    const nights = nightsBetween(input.checkIn, input.checkOut);
    if (nights <= 0) {
      throw new ValidationError("Rango de fechas invalido.");
    }

    const roomType = await getRoomTypeById(input.roomTypeId, { asAdmin: true });
    if (!roomType) throw new NotFoundError("Tipo de habitacion");
    if (roomType.property_id !== input.propertyId) {
      throw new ValidationError("El tipo de habitacion no pertenece a esta propiedad.");
    }

    const totalCents = roomType.base_price_cents * nights;

    const { holdId } = await createBookingHold(
      {
        propertyId: input.propertyId,
        roomTypeId: input.roomTypeId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        totalCents,
        paymentMethod: input.paymentMethod,
        ttlMinutes: ttl,
        guestFullName: input.guestFullName,
        guestDocumentType: input.guestDocumentType,
        guestDocumentNumber: input.guestDocumentNumber,
      },
      { asAdmin: true },
    );

    await logAudit({
      action: "public_booking.hold_created",
      resourceType: "booking_hold",
      resourceId: holdId,
      propertyId: input.propertyId,
      actorType: "system",
      diff: { input: { ...input, totalCents } },
    });

    return { holdId, ttlMinutes: ttl, totalCents };
  });
}
