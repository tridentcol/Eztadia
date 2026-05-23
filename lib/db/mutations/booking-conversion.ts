import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type BookingHoldRow = Database["public"]["Tables"]["booking_holds"]["Row"];

export class HoldNotActiveError extends AppError {
  constructor(public actualStatus: string) {
    super("CONFLICT", `El hold ya no esta activo (status=${actualStatus}).`);
  }
}

/**
 * Convierte un hold en booking + crea un payment pending — operacion atomica
 * a nivel logico (sin SQL function por ahora; race acceptable porque el hold
 * tiene check_status='active' como guard).
 *
 * Idempotente: si ya existe un payment con raw_payload.hold_id = holdId,
 * retorna ese sin re-crear booking + payment.
 *
 * El caller (route handler /api/booking/[holdId]/pse-link) usa esto antes
 * de llamar Wompi para tener un payment.id que sirva como `reference`.
 */
export async function convertHoldToBookingAndCreatePayment(args: {
  holdId: string;
}): Promise<{
  booking: BookingRow;
  payment: PaymentRow;
  hold: BookingHoldRow;
  reused: boolean;
}> {
  const admin = createAdminClient();

  // 1) Carga hold
  const { data: hold, error: holdErr } = await admin
    .from("booking_holds")
    .select("*")
    .eq("id", args.holdId)
    .maybeSingle();
  if (holdErr) throw mapDbError(holdErr);
  if (!hold) throw new NotFoundError("Hold");

  // 2) Idempotencia: payment previa para este holdId?
  const { data: existing } = await admin
    .from("payments")
    .select("*, bookings!inner(*)")
    .filter("raw_payload->>hold_id", "eq", args.holdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing && (existing as unknown as { bookings: BookingRow }).bookings) {
    const { bookings: bookingRel, ...paymentFields } = existing as unknown as
      PaymentRow & { bookings: BookingRow };
    return {
      booking: bookingRel,
      payment: paymentFields as PaymentRow,
      hold,
      reused: true,
    };
  }

  if (hold.status !== "active") {
    throw new HoldNotActiveError(hold.status);
  }

  // 3) Crea booking — usa datos del hold (post-migration 20260523120100
  // booking_holds tiene guest_full_name + document + country).
  const { data: booking, error: bookErr } = await admin
    .from("bookings")
    .insert({
      property_id: hold.property_id,
      room_type_id: hold.room_type_id,
      check_in: hold.check_in,
      check_out: hold.check_out,
      adults: 1,
      children: 0,
      guest_full_name: hold.guest_full_name,
      guest_email: hold.guest_email,
      guest_phone: hold.guest_phone,
      guest_document_type: hold.guest_document_type,
      guest_document_number: hold.guest_document_number,
      guest_country: hold.guest_country,
      total_cents: hold.total_cents,
      status: "pending_payment",
      payment_method: hold.payment_method,
      source: "direct",
    })
    .select()
    .single();
  if (bookErr || !booking) throw mapDbError(bookErr ?? new Error("insert booking failed"));

  // 4) Crea payment pending
  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({
      booking_id: booking.id,
      property_id: hold.property_id,
      amount_cents: hold.total_cents,
      currency: "COP",
      method: hold.payment_method,
      status: "pending",
      raw_payload: { hold_id: args.holdId },
    })
    .select()
    .single();
  if (payErr || !payment) throw mapDbError(payErr ?? new Error("insert payment failed"));

  // 5) Marca hold como consumed (enum HoldStatus)
  const { error: updErr } = await admin
    .from("booking_holds")
    .update({ status: "consumed", updated_at: new Date().toISOString() })
    .eq("id", args.holdId);
  if (updErr) throw mapDbError(updErr);

  return { booking, payment, hold, reused: false };
}

/**
 * Asocia el payment_link de Wompi a un payment existente. Se llama despues
 * de createPaymentLink(...) para guardar el id y reference.
 */
export async function attachWompiLinkToPayment(args: {
  paymentId: string;
  paymentLinkId: string;
  reference: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("payments")
    .update({
      wompi_payment_link_id: args.paymentLinkId,
      wompi_reference: args.reference,
    })
    .eq("id", args.paymentId);
  if (error) throw mapDbError(error);
}
