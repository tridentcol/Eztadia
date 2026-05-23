import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type WebhookLogInsert = Database["public"]["Tables"]["webhook_logs"]["Insert"];

export type WebhookLogStatus =
  | "received"
  | "processed"
  | "failed"
  | "rejected_signature"
  | "rejected_idempotency"
  | "rejected_other";

export type LogWebhookInput = {
  provider: string;                    // "wompi" | "meta_whatsapp" | …
  eventType?: string | null;
  propertyId?: string | null;
  requestId?: string | null;           // ID del provider
  status: WebhookLogStatus;
  httpStatus?: number | null;
  signatureValid?: boolean | null;
  payload?: unknown;                   // body (sanitizado)
  response?: unknown;                  // qué respondimos
  error?: string | null;
  durationMs?: number | null;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Append a webhook_logs row. Best-effort — nunca tira: si el insert falla,
 * tragamos el error (los webhooks SIEMPRE tienen que poder responder rápido
 * a Wompi/Meta, y un fallo de logging no debe romper el flow real).
 *
 * Usa admin client porque RLS bloquea INSERT a authenticated y los webhooks
 * son anónimos.
 */
export async function logWebhook(input: LogWebhookInput): Promise<void> {
  const row: WebhookLogInsert = {
    provider: input.provider,
    event_type: input.eventType ?? null,
    property_id: input.propertyId ?? null,
    request_id: input.requestId ?? null,
    status: input.status,
    http_status: input.httpStatus ?? null,
    signature_valid: input.signatureValid ?? null,
    payload: input.payload as WebhookLogInsert["payload"],
    response: input.response as WebhookLogInsert["response"],
    error: input.error ?? null,
    duration_ms: input.durationMs ?? null,
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
  };

  try {
    const admin = createAdminClient();
    await admin.from("webhook_logs").insert(row);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[logWebhook] insert failed:", err);
    }
    // Tragamos — logging never breaks the webhook.
  }
}
