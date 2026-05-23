"use server";

import { revalidatePath } from "next/cache";
import {
  cancelBookingSchema,
  confirmBookingSchema,
  createHoldSchema,
  assignRoomSchema,
} from "@/lib/validation/booking";
import {
  cancelBooking,
  confirmBooking,
  createBookingHold,
  assignRoom,
} from "@/lib/db/mutations/bookings";
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
