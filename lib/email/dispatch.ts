import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./send";
import { formatCOP } from "@/lib/format";
import PaymentConfirmedEmail from "@/emails/payment-confirmed";
import PaymentRejectedEmail from "@/emails/payment-rejected";
import BookingConfirmationEmail from "@/emails/booking-confirmation";

/**
 * Dispatch helpers que cargan el contexto necesario y mandan el email.
 *
 * Todas son best-effort: si Resend no esta configurada, si la query falla,
 * o si el email rebota, el flow principal (webhook/server action) sigue.
 *
 * Conviven aqui las cosas de payment+booking porque comparten la consulta
 * pesada (`bookings + properties + holds`).
 */

function shortReference(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/**
 * Manda email "Pago confirmado" + (si esta es la primera confirmacion del
 * booking) tambien manda "Reserva confirmada".
 *
 * Idempotencia: email_logs tiene resend_id pero NO hay constraint que
 * impida 2 envios. El webhook esta protegido upstream por idempotency check
 * (payment.status final). Aqui solo nos toca cargar contexto y disparar.
 */
export async function sendPaymentConfirmedEmail(args: {
  paymentId: string;
  methodLabel: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select(
        "id, amount_cents, currency, property_id, booking_id, wompi_reference",
      )
      .eq("id", args.paymentId)
      .maybeSingle();
    if (!payment) return;

    const { data: booking } = await admin
      .from("bookings")
      .select(
        "id, code, guest_email, guest_full_name, check_in, check_out, property_id, room_id",
      )
      .eq("id", payment.booking_id)
      .maybeSingle();
    if (!booking) return;

    const { data: property } = await admin
      .from("properties")
      .select("name, address, contact_phone")
      .eq("id", booking.property_id)
      .maybeSingle();

    const propertyName = property?.name ?? "tu reserva";
    const reference =
      booking.code ?? payment.wompi_reference ?? shortReference(payment.id);

    await sendEmail({
      to: booking.guest_email,
      propertyId: booking.property_id,
      template: "payment-confirmed",
      subject: `Pago confirmado · ${propertyName}`,
      react: PaymentConfirmedEmail({
        guestName: booking.guest_full_name,
        propertyName,
        amountFormatted: formatCOP(Math.round(payment.amount_cents / 100)),
        reference,
        paymentMethodLabel: args.methodLabel,
      }),
    });

    let roomLabel: string | null = null;
    if (booking.room_id) {
      const { data: room } = await admin
        .from("rooms")
        .select("number, floor")
        .eq("id", booking.room_id)
        .maybeSingle();
      if (room) {
        roomLabel = room.floor
          ? `Habitacion ${room.number} · Piso ${room.floor}`
          : `Habitacion ${room.number}`;
      }
    }

    await sendEmail({
      to: booking.guest_email,
      propertyId: booking.property_id,
      template: "booking-confirmation",
      subject: `Tu reserva en ${propertyName} esta confirmada`,
      react: BookingConfirmationEmail({
        guestName: booking.guest_full_name,
        propertyName,
        propertyAddress: property?.address ?? null,
        propertyContactPhone: property?.contact_phone ?? null,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        roomLabel,
        reference,
      }),
    });
  } catch {
    // best-effort
  }
}

export async function sendPaymentRejectedEmail(args: {
  paymentId: string;
  retryUrl?: string | null;
  reasonHint?: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select(
        "id, property_id, booking_id, wompi_reference",
      )
      .eq("id", args.paymentId)
      .maybeSingle();
    if (!payment) return;

    const { data: booking } = await admin
      .from("bookings")
      .select("code, guest_email, guest_full_name, property_id")
      .eq("id", payment.booking_id)
      .maybeSingle();
    if (!booking) return;

    const { data: property } = await admin
      .from("properties")
      .select("name")
      .eq("id", booking.property_id)
      .maybeSingle();

    const propertyName = property?.name ?? "tu reserva";
    const reference =
      booking.code ?? payment.wompi_reference ?? shortReference(payment.id);

    await sendEmail({
      to: booking.guest_email,
      propertyId: booking.property_id,
      template: "payment-rejected",
      subject: `Pago rechazado · ${propertyName}`,
      react: PaymentRejectedEmail({
        guestName: booking.guest_full_name,
        propertyName,
        reference,
        retryUrl: args.retryUrl ?? null,
        reasonHint: args.reasonHint ?? null,
      }),
    });
  } catch {
    // best-effort
  }
}
