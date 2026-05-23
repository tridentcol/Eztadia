import "server-only";
import { AppError } from "@/lib/errors";

/**
 * Cliente minimo de Wompi REST API. Solo cubre lo que el flow publico necesita
 * (crear payment_link); el resto entra cuando se construya el dashboard de
 * pagos avanzado (Phase D+).
 *
 * Wompi docs: https://docs.wompi.co/docs/colombia/inicio-rapido/
 */

const SANDBOX_BASE = "https://sandbox.wompi.co/v1";
const PROD_BASE = "https://production.wompi.co/v1";

export class WompiNotConfiguredError extends AppError {
  constructor() {
    super("VALIDATION", "Wompi no esta configurado para esta propiedad.");
  }
}

export class WompiApiError extends AppError {
  constructor(message: string, public providerCode?: string) {
    super("CONFLICT", message);
  }
}

type WompiCreds = {
  publicKey: string;
  privateKey: string;
  isTestMode: boolean;
};

export type CreatePaymentLinkInput = {
  creds: WompiCreds;
  name: string;            // "Reserva HAB-2026-00012"
  description: string;     // "Suite Marina · 3 noches"
  amountInCents: number;
  currency?: "COP";
  redirectUrl: string;     // /p/[slug]/booking/[holdId]/status
  reference: string;       // unique idempotency key (e.g. payment.id)
  singleUse?: boolean;     // true por default
  expiresAtIso?: string;   // ISO datetime cuando expira el link
};

export type PaymentLinkResult = {
  id: string;
  url: string;
};

/**
 * Crea un payment link de Wompi. Usa SANDBOX o PROD segun isTestMode.
 *
 * IMPORTANTE: payment links de Wompi no soportan reference directamente en el
 * link — la reference se asocia cuando el guest abre el link y crea la
 * transaction. Por eso seteamos `redirect_url` con `?payment_link_id={id}`
 * para que el callback nos identifique. El webhook tambien recibe el
 * payment_link_id.
 */
export async function createPaymentLink(
  input: CreatePaymentLinkInput,
): Promise<PaymentLinkResult> {
  const base = input.creds.isTestMode ? SANDBOX_BASE : PROD_BASE;

  const body = {
    name: input.name,
    description: input.description,
    single_use: input.singleUse ?? true,
    collect_shipping: false,
    currency: input.currency ?? "COP",
    amount_in_cents: input.amountInCents,
    redirect_url: input.redirectUrl,
    expires_at: input.expiresAtIso,
  };

  const res = await fetch(`${base}/payment_links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.creds.privateKey}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new WompiApiError(
      `Wompi rechazo el payment_link (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as { data?: { id?: string } };
  const id = json.data?.id;
  if (!id) throw new WompiApiError("Wompi no devolvio payment_link id.");

  // El URL "checkout" es: https://checkout.wompi.co/l/{id}
  const url = `https://checkout.wompi.co/l/${id}`;
  return { id, url };
}
