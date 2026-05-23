import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

/**
 * Upload de comprobantes de pago (transferencia manual).
 * Bucket privado `payment-proofs`. Acceso via signed URL (no public).
 *
 * Body: multipart/form-data con campos:
 *   file:       archivo (max 10MB, png/jpeg/webp/pdf)
 *   bookingId:  uuid del booking (necesario para auth check + path)
 *
 * Path: `{property_id}/{booking_id}/{timestamp}_{filename}`
 *
 * Auth: cualquier user autenticado puede subir (el flow publico tambien usa
 * esta ruta despues de crear hold; allí no requerimos sesion porque public
 * flow es asAdmin — pero entonces validamos solo via holdId/token...
 * Por ahora: requireUser obligatorio; flow publico va por route separada
 * /api/public/upload/payment-proof si lo agregamos en C+).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const bookingId = form.get("bookingId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (typeof bookingId !== "string" || !bookingId) {
    return NextResponse.json({ error: "missing_bookingId" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "too_large", maxBytes: MAX_SIZE }, { status: 413 });
  }

  // Verificar que el user es member de la propiedad del booking
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("property_id, code")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) {
    return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
  }

  // Subir via admin client (RLS de storage no esta configurada por defecto;
  // controlamos acceso a nivel app verificando booking membership).
  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${booking.property_id}/${bookingId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from("payment-proofs")
    .upload(path, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: "upload_failed", message: upErr.message }, { status: 500 });
  }

  // Signed URL (1 hora) para preview inmediato. El path queda en DB.
  const { data: signed } = await admin.storage
    .from("payment-proofs")
    .createSignedUrl(path, 60 * 60);

  await logAudit({
    action: "payment.proof_uploaded",
    resourceType: "booking",
    resourceId: bookingId,
    propertyId: booking.property_id,
    actorId: user.id,
    diff: { path, size: file.size, type: file.type },
  });

  return NextResponse.json({
    path,
    signedUrl: signed?.signedUrl ?? null,
  });
}
