"use server";

import { publicBookingSubmitSchema } from "@/lib/validation/booking";
import { createBookingHold } from "@/lib/db/mutations/bookings";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/**
 * Server action que el flow publico /p/[slug]/booking/new dispara.
 *
 * NO requiere auth (anon). Por eso pasa `asAdmin: true` a createBookingHold
 * — la function SQL hace el check de disponibilidad atomico.
 *
 * El hold queda activo TTL minutos (pse=15, manual=1440=24h). Caller
 * redirige a /booking/[holdId]/pay donde el guest paga o sube comprobante.
 */
export async function publicCreateHoldAction(raw: unknown) {
  return run(publicBookingSubmitSchema, raw, async (input) => {
    const ttl = input.paymentMethod === "pse" ? 15 : 60 * 24;

    // TODO(B5/B6): calcular total_cents real desde room_type.base_price_cents
    // * nights, aplicando seasonal_rates. Por ahora el cliente envia
    // el total ya calculado (lo verificamos en B7 contra el query).
    const { holdId } = await createBookingHold(
      {
        propertyId: input.propertyId,
        roomTypeId: input.roomTypeId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        totalCents: 0, // se setea desde booking final, no en el hold
        paymentMethod: input.paymentMethod,
        ttlMinutes: ttl,
      },
      { asAdmin: true },
    );

    await logAudit({
      action: "public_booking.hold_created",
      resourceType: "booking_hold",
      resourceId: holdId,
      propertyId: input.propertyId,
      actorType: "system",
      diff: { input },
    });

    return { holdId, ttlMinutes: ttl };
  });
}
