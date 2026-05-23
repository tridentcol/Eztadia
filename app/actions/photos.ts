"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePropertyRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { uuid as uuidSchema } from "@/lib/validation/common";
import { logAudit } from "@/lib/audit";
import { mapDbError, NotFoundError, ValidationError } from "@/lib/errors";
import type { Json } from "@/lib/supabase/database.types";
import { run } from "./_helpers";

/**
 * Server actions del Photos tab (property-settings).
 *
 * Modelo:
 * - Cada foto en `properties.gallery[]` lleva { id, url, alt, path? }.
 * - El primer elemento es la portada → mantenemos `properties.cover_image_url`
 *   sincronizado con él para que landing y dashboard owner lo lean directo.
 * - El bucket `property-photos` es PUBLIC. Validación de mime/tamaño/cantidad
 *   en el servidor; sin RLS de storage (todo va por service_role tras
 *   requirePropertyRole). Borramos del bucket por `path`.
 *
 * Cada acción es inmediata (sin SaveBar/cancel). Los archivos no pueden quedar
 * huérfanos: cada upload persiste el row, cada delete borra primero del bucket.
 */

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 30;

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  path?: string;
};

async function readGallery(propertyId: string): Promise<GalleryPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("gallery")
    .eq("id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Propiedad");
  return Array.isArray(data.gallery) ? (data.gallery as GalleryPhoto[]) : [];
}

async function writeGallery(
  propertyId: string,
  photos: GalleryPhoto[],
): Promise<void> {
  const supabase = await createClient();
  const cover = photos[0]?.url ?? null;
  const { error } = await supabase
    .from("properties")
    .update({
      gallery: photos as unknown as Json,
      cover_image_url: cover,
    })
    .eq("id", propertyId);
  if (error) throw mapDbError(error);
}

/**
 * Upload de UNA foto. FormData con campos:
 *   propertyId: uuid
 *   file:       File (png/jpeg/webp, <=5MB)
 *   alt:        string (puede ser vacío; cap 200 chars)
 */
export async function uploadPropertyPhotoAction(form: FormData) {
  try {
    const propertyId = String(form.get("propertyId") ?? "");
    const altRaw = String(form.get("alt") ?? "").slice(0, 200);
    const file = form.get("file");

    if (!uuidSchema.safeParse(propertyId).success) {
      return { ok: false as const, error: "propertyId inválido." };
    }
    if (!(file instanceof File)) {
      return { ok: false as const, error: "Archivo requerido." };
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return {
        ok: false as const,
        error: "Formato no soportado. Usa PNG, JPG o WebP.",
      };
    }
    if (file.size > MAX_BYTES) {
      return {
        ok: false as const,
        error: "La imagen excede 5 MB.",
      };
    }

    await requirePropertyRole(propertyId, "manager");

    const current = await readGallery(propertyId);
    if (current.length >= MAX_PHOTOS) {
      throw new ValidationError(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);
    }

    const admin = createAdminClient();
    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "jpg";
    const path = `${propertyId}/gallery/${Date.now()}-${id}.${safeExt}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: upErr } = await admin.storage
      .from("property-photos")
      .upload(path, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });
    if (upErr) {
      return {
        ok: false as const,
        error: `Error subiendo: ${upErr.message}`,
      };
    }
    const { data: pub } = admin.storage
      .from("property-photos")
      .getPublicUrl(path);

    const next: GalleryPhoto[] = [
      ...current,
      { id, url: pub.publicUrl, alt: altRaw, path },
    ];
    await writeGallery(propertyId, next);

    await logAudit({
      action: "property.photo_uploaded",
      resourceType: "property",
      resourceId: propertyId,
      propertyId,
      diff: { path, size: file.size, total: next.length },
    });

    revalidatePath("/dashboard/property-settings");
    return {
      ok: true as const,
      photo: { id, url: pub.publicUrl, alt: altRaw, path },
    };
  } catch (err) {
    return {
      ok: false as const,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo subir la foto. Intenta de nuevo.",
    };
  }
}

const deleteSchema = z.object({
  propertyId: uuidSchema,
  photoId: z.string().min(1),
});

export async function deletePropertyPhotoAction(raw: unknown) {
  return run(deleteSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");

    const current = await readGallery(input.propertyId);
    const target = current.find((p) => p.id === input.photoId);
    if (!target) throw new NotFoundError("Foto");

    // 1. Quitar del array primero (si el delete del bucket falla, no queda
    //    referencia colgando en gallery).
    const next = current.filter((p) => p.id !== input.photoId);
    await writeGallery(input.propertyId, next);

    // 2. Borrar del bucket — best effort. Si falla, ya no hay row apuntando
    //    al archivo; queda huérfano pero no es referenciable en UI.
    if (target.path) {
      const admin = createAdminClient();
      await admin.storage.from("property-photos").remove([target.path]);
    }

    await logAudit({
      action: "property.photo_deleted",
      resourceType: "property",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
      diff: { photoId: input.photoId, path: target.path ?? null },
    });

    revalidatePath("/dashboard/property-settings");
    return { ok: true as const };
  });
}

const setCoverSchema = z.object({
  propertyId: uuidSchema,
  photoId: z.string().min(1),
});

export async function setCoverPhotoAction(raw: unknown) {
  return run(setCoverSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");

    const current = await readGallery(input.propertyId);
    const idx = current.findIndex((p) => p.id === input.photoId);
    if (idx < 0) throw new NotFoundError("Foto");
    if (idx === 0) return { ok: true as const }; // ya era portada

    const next = [...current];
    const [pick] = next.splice(idx, 1);
    next.unshift(pick);
    await writeGallery(input.propertyId, next);

    revalidatePath("/dashboard/property-settings");
    return { ok: true as const };
  });
}

const reorderSchema = z.object({
  propertyId: uuidSchema,
  photoIds: z.array(z.string().min(1)).min(1).max(MAX_PHOTOS),
});

export async function reorderGalleryAction(raw: unknown) {
  return run(reorderSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");

    const current = await readGallery(input.propertyId);
    const byId = new Map(current.map((p) => [p.id, p]));
    if (input.photoIds.length !== current.length) {
      throw new ValidationError("El orden no incluye todas las fotos.");
    }
    const next: GalleryPhoto[] = [];
    for (const id of input.photoIds) {
      const p = byId.get(id);
      if (!p) throw new ValidationError("Foto desconocida en el nuevo orden.");
      next.push(p);
    }
    await writeGallery(input.propertyId, next);

    revalidatePath("/dashboard/property-settings");
    return { ok: true as const };
  });
}
