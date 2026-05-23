import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHoldById } from "@/lib/db/queries/holds";
import { convertHoldToBookingAndCreatePayment } from "@/lib/db/mutations/booking-conversion";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/public/payment-proof/[holdId]
 *
 * Sube comprobante de transferencia desde el flow publico /pay/manual.
 * NO requiere auth — holdId actua como bearer token (UUIDv4 = 122 bits).
 *
 * Side-effects:
 *   1. Convierte hold → booking + payment pending (idempotente)
 *   2. Sube archivo a bucket payment-proofs
 *   3. Setea payment.proof_url
 *   4. Setea booking.status = pending_payment (queda asi hasta que staff
 *      confirma via dashboard)
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ holdId: string }> },
) {
  const { holdId } = await ctx.params;

  const hold = await getHoldById(holdId);
  if (!hold) {
    return NextResponse.json({ error: "hold_not_found" }, { status: 404 });
  }
  if (hold.payment_method !== "manual_transfer") {
    return NextResponse.json(
      { error: "wrong_payment_method", method: hold.payment_method },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "too_large", maxBytes: MAX_SIZE }, { status: 413 });
  }

  // 1) Convierte hold → booking + payment (idempotente)
  const conv = await convertHoldToBookingAndCreatePayment({
    holdId,
    // Datos del guest no se persisten todavia en hold; el form en /booking/new
    // los envia pero los descartamos antes de crear el hold. TODO C+:
    // persistir en una tabla aparte para que el booking final los tenga.
  });

  // 2) Upload archivo
  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${hold.property_id}/${conv.booking.id}/proof-${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from("payment-proofs")
    .upload(path, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json(
      { error: "upload_failed", message: upErr.message },
      { status: 500 },
    );
  }

  // 3) Set payment.proof_url
  const { error: payUpdErr } = await admin
    .from("payments")
    .update({ proof_url: path })
    .eq("id", conv.payment.id);
  if (payUpdErr) {
    // Archivo subido pero metadata fallo — log y aceptamos
    if (process.env.NODE_ENV !== "production") {
      console.error("[public-proof] payment update failed", payUpdErr.message);
    }
  }

  await logAudit({
    action: "public_booking.proof_uploaded",
    resourceType: "payment",
    resourceId: conv.payment.id,
    propertyId: hold.property_id,
    actorType: "system",
    diff: { holdId, bookingId: conv.booking.id, path, size: file.size, type: file.type },
  });

  return NextResponse.json({
    ok: true,
    bookingId: conv.booking.id,
    paymentId: conv.payment.id,
    proofPath: path,
  });
}
