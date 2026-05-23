import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePropertyRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

/**
 * Upload de fotos de propiedad (cover, gallery, room_types gallery).
 * Bucket publico `property-photos`. La URL pasa al campo correspondiente.
 *
 * Body: multipart/form-data con:
 *   file:        archivo (max 5MB, png/jpeg/webp)
 *   propertyId:  uuid de la propiedad
 *   kind:        "cover" | "gallery" | "room"  (informativo, organiza path)
 *
 * Auth: manager+ via requirePropertyRole.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const propertyId = form.get("propertyId");
  const kind = String(form.get("kind") ?? "gallery");

  if (typeof propertyId !== "string" || !propertyId) {
    return NextResponse.json({ error: "missing_propertyId" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "too_large", maxBytes: MAX_SIZE }, { status: 413 });
  }

  let ctx;
  try {
    ctx = await requirePropertyRole(propertyId, "manager");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeKind = ["cover", "gallery", "room"].includes(kind) ? kind : "gallery";
  const path = `${propertyId}/${safeKind}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from("property-photos")
    .upload(path, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: "upload_failed", message: upErr.message }, { status: 500 });
  }

  const { data: pub } = admin.storage.from("property-photos").getPublicUrl(path);

  await logAudit({
    action: "property.photo_uploaded",
    resourceType: "property",
    resourceId: propertyId,
    propertyId,
    actorId: ctx.user.id,
    diff: { path, kind: safeKind, size: file.size },
  });

  return NextResponse.json({
    path,
    publicUrl: pub.publicUrl,
  });
}
