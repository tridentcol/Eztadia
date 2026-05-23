"use server";

import { revalidatePath } from "next/cache";
import { confirmManualPaymentSchema } from "@/lib/validation/payment";
import { confirmManualPayment } from "@/lib/db/mutations/payments";
import { confirmBooking } from "@/lib/db/mutations/bookings";
import { requirePropertyRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { sendPaymentConfirmedEmail } from "@/lib/email/dispatch";
import { run } from "./_helpers";

export async function confirmManualPaymentAction(raw: unknown) {
  return run(confirmManualPaymentSchema, raw, async (input) => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: payment } = await supabase
      .from("payments")
      .select("property_id, booking_id, status")
      .eq("id", input.paymentId)
      .maybeSingle();
    if (!payment) throw new Error("Pago no encontrado.");

    await requirePropertyRole(payment.property_id, "manager");
    const updated = await confirmManualPayment(input);

    // Confirma el booking asociado si seguia pending_payment
    await confirmBooking({ bookingId: payment.booking_id });

    await logAudit({
      action: "payment.confirmed_manual",
      resourceType: "payment",
      resourceId: input.paymentId,
      propertyId: payment.property_id,
      diff: { before: { status: payment.status }, after: { status: "approved" } },
    });

    // Email best-effort (no rompe el flow).
    await sendPaymentConfirmedEmail({
      paymentId: input.paymentId,
      methodLabel: "Transferencia bancaria",
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/calendar");
    return { payment: updated };
  });
}
