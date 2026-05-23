"use server";

import { revalidatePath } from "next/cache";
import {
  cancelBookingSchema,
  confirmBookingSchema,
  createHoldSchema,
  assignRoomSchema,
  createManualBookingSchema,
} from "@/lib/validation/booking";
import {
  cancelBooking,
  confirmBooking,
  createBookingHold,
  createManualBooking,
  assignRoom,
} from "@/lib/db/mutations/bookings";
import { checkAvailability } from "@/lib/db/queries/availability";
import { NoAvailabilityError } from "@/lib/errors";
import { requirePropertyRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/**
 * Crea hold desde el dashboard (staff escribe a mano la reserva).
 * Flow publico /p/[slug] usa una accion separada con asAdmin (B11/B14).
 */
export async function createHoldAction(raw: unknown) {
  return run(createHoldSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "reception");
    const { holdId } = await createBookingHold({
      ...input,
      ttlMinutes: input.ttlMinutes ?? (input.paymentMethod === "pse" ? 15 : 1440),
      // Dashboard "Nueva reserva manual" todavia no captura nombre del guest
      // en el flow staff — usa placeholder hasta que esa UI llegue (Phase D).
      guestFullName: "Reserva manual",
    });
    await logAudit({
      action: "booking_hold.created",
      resourceType: "booking_hold",
      resourceId: holdId,
      propertyId: input.propertyId,
      diff: { input },
    });
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    return { holdId };
  });
}

export async function cancelBookingAction(raw: unknown) {
  return run(cancelBookingSchema, raw, async (input) => {
    // Necesitamos saber la propiedad — leemos el booking primero.
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("property_id, status, code")
      .eq("id", input.bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Reserva no encontrada.");

    await requirePropertyRole(booking.property_id, "manager");
    const updated = await cancelBooking(input);
    await logAudit({
      action: "booking.cancelled",
      resourceType: "booking",
      resourceId: input.bookingId,
      propertyId: booking.property_id,
      diff: { before: { status: booking.status }, after: { status: "cancelled" }, reason: input.reason },
    });
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    return { booking: updated };
  });
}

export async function confirmBookingAction(raw: unknown) {
  return run(confirmBookingSchema, raw, async (input) => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("property_id, status")
      .eq("id", input.bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Reserva no encontrada.");

    await requirePropertyRole(booking.property_id, "reception");
    const updated = await confirmBooking(input);
    await logAudit({
      action: "booking.confirmed",
      resourceType: "booking",
      resourceId: input.bookingId,
      propertyId: booking.property_id,
      diff: { before: { status: booking.status }, after: { status: "confirmed", roomId: input.roomId } },
    });
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    return { booking: updated };
  });
}

export async function createManualBookingAction(raw: unknown) {
  return run(createManualBookingSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "reception");

    // Chequeo de disponibilidad antes de insertar — no doble-bookeamos.
    const avail = await checkAvailability({
      propertyId: input.propertyId,
      roomTypeId: input.roomTypeId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });
    if (avail.available_rooms <= 0) throw new NoAvailabilityError();

    const booking = await createManualBooking({
      propertyId: input.propertyId,
      roomTypeId: input.roomTypeId,
      roomId: input.roomId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      children: input.children,
      guestFullName: input.guestFullName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      guestDocumentType: input.guestDocumentType,
      guestDocumentNumber: input.guestDocumentNumber,
      totalCents: input.totalCents,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
    });

    await logAudit({
      action: "booking.created_manual",
      resourceType: "booking",
      resourceId: booking.id,
      propertyId: input.propertyId,
      diff: { input: { ...input, guestEmail: "[redacted]", guestPhone: "[redacted]" } },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");
    return { booking };
  });
}

export async function assignRoomAction(raw: unknown) {
  return run(assignRoomSchema, raw, async (input) => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("property_id")
      .eq("id", input.bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Reserva no encontrada.");

    await requirePropertyRole(booking.property_id, "reception");
    const updated = await assignRoom(input);
    await logAudit({
      action: "booking.room_assigned",
      resourceType: "booking",
      resourceId: input.bookingId,
      propertyId: booking.property_id,
      diff: { roomId: input.roomId },
    });
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    return { booking: updated };
  });
}
