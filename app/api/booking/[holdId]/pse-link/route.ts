import { NextResponse, type NextRequest } from "next/server";
import { getHoldById } from "@/lib/db/queries/holds";
import { loadWompiCredsForProperty } from "@/lib/db/mutations/wompi";
import {
  convertHoldToBookingAndCreatePayment,
  attachWompiLinkToPayment,
  HoldNotActiveError,
} from "@/lib/db/mutations/booking-conversion";
import { createPaymentLink } from "@/lib/wompi/api";
import { getPropertyBySlug } from "@/lib/db/queries/property";
import { logAudit } from "@/lib/audit";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/booking/[holdId]/pse-link
 *
 * Anon endpoint que el flow publico llama al hacer click en "Pagar con PSE".
 * Convierte hold → booking + payment, crea payment_link en Wompi, retorna URL.
 *
 * Idempotente: clicks repetidos retornan el mismo payment_link (no Wompi
 * round-trip extra si ya esta cacheado).
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ holdId: string }> },
) {
  try {
    const { holdId } = await ctx.params;
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug") ?? "";

    const hold = await getHoldById(holdId);
    if (!hold) {
      return NextResponse.json({ error: "hold_not_found" }, { status: 404 });
    }
    if (hold.payment_method !== "pse") {
      return NextResponse.json(
        { error: "wrong_payment_method", method: hold.payment_method },
        { status: 400 },
      );
    }

    const property = slug
      ? await getPropertyBySlug(slug)
      : null;
    if (!property || property.id !== hold.property_id) {
      return NextResponse.json({ error: "property_mismatch" }, { status: 400 });
    }

    const creds = await loadWompiCredsForProperty(hold.property_id);
    if (!creds) {
      return NextResponse.json(
        {
          error: "wompi_not_configured",
          message:
            "Esta propiedad aun no tiene Wompi configurado. El admin debe configurarlo en /dashboard/integrations/wompi.",
        },
        { status: 503 },
      );
    }

    // Convierte hold → booking + payment (idempotente)
    const { booking, payment, reused } = await convertHoldToBookingAndCreatePayment({
      holdId,
    });

    let paymentLinkId = payment.wompi_payment_link_id;
    let paymentLinkUrl: string | null = null;

    if (paymentLinkId) {
      // Reuse del link previo
      paymentLinkUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;
    } else {
      const reference = `${booking.code}-${payment.id.slice(0, 8)}`;
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/p/${property.slug}/booking/${holdId}/status`;

      const result = await createPaymentLink({
        creds,
        name: `Reserva ${booking.code}`,
        description: `${hold.check_in} → ${hold.check_out}`,
        amountInCents: payment.amount_cents,
        currency: "COP",
        redirectUrl,
        reference,
        singleUse: true,
        expiresAtIso: hold.expires_at,
      });

      paymentLinkId = result.id;
      paymentLinkUrl = result.url;

      await attachWompiLinkToPayment({
        paymentId: payment.id,
        paymentLinkId: result.id,
        reference,
      });
    }

    await logAudit({
      action: reused ? "wompi.payment_link_reused" : "wompi.payment_link_created",
      resourceType: "payment",
      resourceId: payment.id,
      propertyId: hold.property_id,
      actorType: "system",
      diff: { holdId, bookingId: booking.id, paymentLinkId },
    });

    return NextResponse.json({
      url: paymentLinkUrl,
      bookingId: booking.id,
      paymentId: payment.id,
    });
  } catch (err) {
    if (err instanceof HoldNotActiveError) {
      return NextResponse.json(
        { error: "hold_not_active", status: err.actualStatus },
        { status: 409 },
      );
    }
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[pse-link]", err);
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
