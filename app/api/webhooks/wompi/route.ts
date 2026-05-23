import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt, verifyHmacSha256 } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { logWebhook, type WebhookLogStatus } from "@/lib/webhooks/log";
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
 * Toda la ejecución se loguea en webhook_logs (best-effort, nunca rompe).
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
  const startedAt = Date.now();
  const raw = await request.text();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  // Mutated as we learn más del request — final log se escribe en finish().
  const ctx: {
    eventType: string | null;
    requestId: string | null;
    propertyId: string | null;
    signatureValid: boolean | null;
    parsedPayload: unknown;
  } = {
    eventType: null,
    requestId: null,
    propertyId: null,
    signatureValid: null,
    parsedPayload: null,
  };

  async function finish(opts: {
    status: WebhookLogStatus;
    http: number;
    response: Record<string, unknown>;
    error?: string;
  }): Promise<NextResponse> {
    await logWebhook({
      provider: "wompi",
      eventType: ctx.eventType,
      requestId: ctx.requestId,
      propertyId: ctx.propertyId,
      signatureValid: ctx.signatureValid,
      payload: ctx.parsedPayload ?? { raw_first_200: raw.slice(0, 200) },
      response: opts.response,
      status: opts.status,
      httpStatus: opts.http,
      error: opts.error ?? null,
      durationMs: Date.now() - startedAt,
      ip,
      userAgent,
    });
    return NextResponse.json(opts.response, { status: opts.http });
  }

  let evt: WompiEvent;
  try {
    evt = JSON.parse(raw) as WompiEvent;
    ctx.parsedPayload = evt;
  } catch {
    return finish({
      status: "rejected_other",
      http: 200,
      response: { error: "invalid_json" },
      error: "invalid_json",
    });
  }

  ctx.eventType = evt.event;
  const admin = createAdminClient();
  const txId = evt.data?.transaction?.id;
  const txRef = evt.data?.transaction?.reference;
  ctx.requestId = txId ?? null;

  if (!txId) {
    return finish({
      status: "rejected_other",
      http: 200,
      response: { error: "missing_transaction" },
      error: "missing_transaction",
    });
  }

  // Idempotencia
  const { data: existing } = await admin
    .from("payments")
    .select("id, property_id, booking_id, status")
    .eq("wompi_transaction_id", txId)
    .maybeSingle();

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
    await logAudit({
      action: "wompi.event_orphan",
      resourceType: "payment",
      actorType: "webhook",
      diff: { transactionId: txId, reference: txRef },
    });
    return finish({
      status: "rejected_other",
      http: 200,
      response: { ok: true, note: "no_matching_payment" },
      error: "no_matching_payment",
    });
  }

  ctx.propertyId = payment.property_id;

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
      return finish({
        status: "failed",
        http: 200,
        response: { error: "decrypt_failed" },
        error: "decrypt_failed",
      });
    }
    const checksum =
      evt.signature?.checksum ?? request.headers.get("x-event-signature") ?? "";
    const valid = verifyHmacSha256(raw, checksum, secret);
    ctx.signatureValid = valid;
    if (!valid) {
      await logAudit({
        action: "wompi.bad_signature",
        resourceType: "payment",
        resourceId: payment.id,
        propertyId: payment.property_id,
        actorType: "webhook",
        diff: { transactionId: txId },
      });
      return finish({
        status: "rejected_signature",
        http: 401,
        response: { error: "bad_signature" },
        error: "bad_signature",
      });
    }
  } else {
    // Sin secret configurado → test mode. signatureValid queda null.
  }

  // Idempotente: si payment ya esta en estado final, no rehacemos.
  if (
    payment.status === "approved" ||
    payment.status === "declined" ||
    payment.status === "voided"
  ) {
    return finish({
      status: "rejected_idempotency",
      http: 200,
      response: { ok: true, note: "already_processed" },
    });
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
    diff: {
      transactionId: tx.id,
      status: tx.status,
      amount: tx.amount_in_cents,
    },
  });

  return finish({
    status: "processed",
    http: 200,
    response: { ok: true },
  });
}

function mapWompiStatus(
  s: WompiEvent["data"]["transaction"]["status"],
): "approved" | "declined" | "voided" | "pending" {
  switch (s) {
    case "APPROVED":
      return "approved";
    case "DECLINED":
    case "ERROR":
      return "declined";
    case "VOIDED":
      return "voided";
    case "PENDING":
    default:
      return "pending";
  }
}
