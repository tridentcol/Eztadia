import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError, ForbiddenError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentMethod = Database["public"]["Enums"]["PaymentMethod"];

/**
 * Confirma un pago manual (transferencia bancaria con comprobante subido).
 * Solo manager+ via RLS. Marca payment.status=approved y aplica side-effect:
 * el booking pasa de pending_payment → confirmed via confirmBooking() en
 * el caller (server action en B7).
 */
export async function confirmManualPayment(args: {
  paymentId: string;
  proofUrl?: string;
}): Promise<PaymentRow> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new ForbiddenError();

  const patch: Database["public"]["Tables"]["payments"]["Update"] = {
    status: "approved",
    confirmed_by: user.id,
    confirmed_at: new Date().toISOString(),
  };
  if (args.proofUrl) patch.proof_url = args.proofUrl;

  const { data, error } = await supabase
    .from("payments")
    .update(patch)
    .eq("id", args.paymentId)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Pago");
  return data;
}

/**
 * Crea un payment vinculado a un booking. Usado por webhook Wompi (PSE) y
 * por flow manual cuando staff sube el comprobante.
 */
export async function createPayment(args: {
  bookingId: string;
  propertyId: string;
  amountCents: number;
  method: PaymentMethod;
  status?: PaymentRow["status"];
  wompiTransactionId?: string;
  wompiReference?: string;
  wompiPaymentLinkId?: string;
  proofUrl?: string;
  rawPayload?: unknown;
}, opts: { asAdmin?: boolean } = {}): Promise<PaymentRow> {
  // Webhooks corren sin auth de user → usan admin client.
  const client = opts.asAdmin
    ? (await import("@/lib/supabase/admin")).createAdminClient()
    : await createClient();

  const { data, error } = await client
    .from("payments")
    .insert({
      booking_id: args.bookingId,
      property_id: args.propertyId,
      amount_cents: args.amountCents,
      method: args.method,
      status: args.status ?? "pending",
      wompi_transaction_id: args.wompiTransactionId ?? null,
      wompi_reference: args.wompiReference ?? null,
      wompi_payment_link_id: args.wompiPaymentLinkId ?? null,
      proof_url: args.proofUrl ?? null,
      raw_payload: (args.rawPayload as Database["public"]["Tables"]["payments"]["Insert"]["raw_payload"]) ?? null,
    })
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Pago");
  return data;
}
