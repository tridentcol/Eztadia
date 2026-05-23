import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt, verifyHmacSha256 } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { confirmBooking } from "@/lib/db/mutations/bookings";
import type { Database } from "@/lib/supabase/database.types";

type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

/**
 * Webhook de Wompi (PSE) — POST con eventos de transacciones.
 *
 * Validacion:
 *   1. Body raw → parseamos JSON pero retenemos el string para HMAC.
 *   2. Header `x-event-signature` (Wompi format: hex de sha256(payload+secret)).
 *      Recuperamos el events_secret desde wompi_configs (cifrado en DB).
 *   3. Idempotencia: si ya existe payment con wompi_transaction_id, ignoramos.
 *   4. Actualizamos payment.status + booking.status segun el evento.
 *
 * NUNCA tirar 500 — Wompi reintenta. Devolvemos 200 incluso ante datos no
 * accionables (asi no acumula deuda de reintentos).
 */

export const dynamic = "force-dynamic";

type WompiEvent = {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      amount_in_cents: number;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "PENDING" | "ERROR";
      payment_method_type?: string;
      payment_link_id?: string;
    };
  };
  sent_at?: string;
  signature?: { checksum?: string; properties?: string[] };
  environment?: "test" | "production";
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  let evt: WompiEvent;
  try {
    evt = JSON.parse(raw) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 200 });
  }

  // ¿Qué propiedad procesa este evento? El payment.wompi_reference suele
  // codificar el booking_id; lo resolvemos buscando en payments.
  const admin = createAdminClient();
  const txId = evt.data?.transaction?.id;
  const txRef = evt.data?.transaction?.reference;
  if (!txId) {
    return NextResponse.json({ error: "missing_transaction" }, { status: 200 });
  }

  // Idempotencia
  const { data: existing } = await admin
    .from("payments")
    .select("id, property_id, booking_id, status")
    .eq("wompi_transaction_id", txId)
    .maybeSingle();

  // Si no existe, buscamos por reference (primer webhook tras crear payment_link)
  let payment = existing;
  if (!payment && txRef) {
    const { data: byRef } = await admin
      .from("payments")
      .select("id, property_id, booking_id, status")
      .eq("wompi_reference", txRef)
      .maybeSingle();
    payment = byRef ?? null;
  }

  if (!payment) {
    // Evento huerfano (no hay payment pre-creado) — log y ack.
    await logAudit({
      action: "wompi.event_orphan",
      resourceType: "payment",
      actorType: "webhook",
      diff: { transactionId: txId, reference: txRef },
    });
    return NextResponse.json({ ok: true, note: "no_matching_payment" });
  }

  // Validar HMAC contra el events_secret de la propiedad.
  const { data: wompiCfg } = await admin
    .from("wompi_configs")
    .select("events_secret_encrypted")
    .eq("property_id", payment.property_id)
    .maybeSingle();

  if (wompiCfg?.events_secret_encrypted) {
    let secret: string | null = null;
    try {
      secret = decrypt(wompiCfg.events_secret_encrypted);
    } catch {
      // Si no podemos descifrar, no podemos verificar — rechazamos.
      return NextResponse.json({ error: "decrypt_failed" }, { status: 200 });
    }
    const checksum = evt.signature?.checksum ?? request.headers.get("x-event-signature") ?? "";
    if (!verifyHmacSha256(raw, checksum, secret)) {
      await logAudit({
        action: "wompi.bad_signature",
        resourceType: "payment",
        resourceId: payment.id,
        propertyId: payment.property_id,
        actorType: "webhook",
        diff: { transactionId: txId },
      });
      return NextResponse.json({ error: "bad_signature" }, { status: 401 });
    }
  }
  // Si no hay events_secret configurado, aceptamos sin validar (test mode).

  // Idempotente: si payment ya esta en estado final, no rehacemos.
  if (payment.status === "approved" || payment.status === "declined" || payment.status === "voided") {
    return NextResponse.json({ ok: true, note: "already_processed" });
  }

  const tx = evt.data.transaction;
  const newStatus = mapWompiStatus(tx.status);

  const update: PaymentUpdate = {
    status: newStatus,
    wompi_transaction_id: tx.id,
    wompi_payment_link_id: tx.payment_link_id ?? null,
    raw_payload: evt as unknown as PaymentUpdate["raw_payload"],
    confirmed_at: newStatus === "approved" ? new Date().toISOString() : null,
  };

  await admin.from("payments").update(update).eq("id", payment.id);

  // Side effect: si approved, confirmar booking
  if (newStatus === "approved" && payment.booking_id) {
    try {
      await confirmBooking({ bookingId: payment.booking_id });
    } catch {
      // No bloqueamos el webhook — booking puede confirmarse manualmente.
    }
  }

  await logAudit({
    action: `wompi.${tx.status.toLowerCase()}`,
    resourceType: "payment",
    resourceId: payment.id,
    propertyId: payment.property_id,
    actorType: "webhook",
    diff: { transactionId: tx.id, status: tx.status, amount: tx.amount_in_cents },
  });

  return NextResponse.json({ ok: true });
}

function mapWompiStatus(s: WompiEvent["data"]["transaction"]["status"]): "approved" | "declined" | "voided" | "pending" {
  switch (s) {
    case "APPROVED": return "approved";
    case "DECLINED":
    case "ERROR":    return "declined";
    case "VOIDED":   return "voided";
    case "PENDING":
    default:         return "pending";
  }
}
