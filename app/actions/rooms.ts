"use server";

import { revalidatePath } from "next/cache";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  createRoomSchema,
  updateRoomSchema,
} from "@/lib/validation/room";
import {
  createRoomType,
  updateRoomType,
  createRoom,
  updateRoom,
} from "@/lib/db/mutations/rooms";
import { requirePropertyRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";
import { can } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/* ─── ROOM TYPES ─── */

export async function createRoomTypeAction(raw: unknown) {
  return run(createRoomTypeSchema, raw, async (input) => {
    const ctx = await requirePropertyRole(input.propertyId, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const rt = await createRoomType(input);

    await logAudit({
      action: "room_type.created",
      resourceType: "room_type",
      resourceId: rt.id,
      propertyId: input.propertyId,
      diff: { input },
    });

    revalidatePath("/dashboard/rooms");
    return { roomType: rt };
  });
}

export async function updateRoomTypeAction(raw: unknown) {
  return run(updateRoomTypeSchema, raw, async (input) => {
    const { id, ...patch } = input;

    // Necesitamos saber a que propiedad pertenece para autorizar.
    // En lugar de un query extra, leemos via la mutation (que devuelve la fila).
    // Pero requirePropertyRole exige propertyId ANTES. Trade-off: hacemos un
    // select pequeno aqui para resolver property_id.
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: existing, error: readErr } = await supabase
      .from("room_types")
      .select("property_id")
      .eq("id", id)
      .maybeSingle();
    if (readErr || !existing) throw new ForbiddenError();

    const ctx = await requirePropertyRole(existing.property_id, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const dbPatch: Record<string, unknown> = {};
    if (patch.nameEs !== undefined) dbPatch.name_es = patch.nameEs;
    if (patch.nameEn !== undefined) dbPatch.name_en = patch.nameEn;
    if (patch.descriptionEs !== undefined) dbPatch.description_es = patch.descriptionEs;
    if (patch.basePriceCents !== undefined) dbPatch.base_price_cents = patch.basePriceCents;
    if (patch.capacityAdults !== undefined) dbPatch.capacity_adults = patch.capacityAdults;
    if (patch.capacityChildren !== undefined) dbPatch.capacity_children = patch.capacityChildren;
    if (patch.sizeM2 !== undefined) dbPatch.size_m2 = patch.sizeM2;
    if (patch.bedConfiguration !== undefined) dbPatch.bed_configuration = patch.bedConfiguration;
    if (patch.amenities !== undefined) dbPatch.amenities = patch.amenities;
    if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;

    const rt = await updateRoomType(id, dbPatch);

    await logAudit({
      action: "room_type.updated",
      resourceType: "room_type",
      resourceId: id,
      propertyId: existing.property_id,
      diff: { input: patch },
    });

    revalidatePath("/dashboard/rooms");
    revalidatePath(`/p/${rt.property_id}`); // best-effort; el real seria via slug
    return { roomType: rt };
  });
}

/* ─── ROOMS (FISICAS) ─── */

export async function createRoomAction(raw: unknown) {
  return run(createRoomSchema, raw, async (input) => {
    const ctx = await requirePropertyRole(input.propertyId, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const room = await createRoom(input);

    await logAudit({
      action: "room.created",
      resourceType: "room",
      resourceId: room.id,
      propertyId: input.propertyId,
      diff: { input },
    });

    revalidatePath("/dashboard/rooms");
    return { room };
  });
}

export async function updateRoomAction(raw: unknown) {
  return run(updateRoomSchema, raw, async (input) => {
    const { id, ...patch } = input;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: existing, error: readErr } = await supabase
      .from("rooms")
      .select("property_id")
      .eq("id", id)
      .maybeSingle();
    if (readErr || !existing) throw new ForbiddenError();

    const ctx = await requirePropertyRole(existing.property_id, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const dbPatch: Record<string, unknown> = {};
    if (patch.roomTypeId !== undefined) dbPatch.room_type_id = patch.roomTypeId;
    if (patch.number !== undefined) dbPatch.number = patch.number;
    if (patch.floor !== undefined) dbPatch.floor = patch.floor;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;

    const room = await updateRoom(id, dbPatch);

    await logAudit({
      action: "room.updated",
      resourceType: "room",
      resourceId: id,
      propertyId: existing.property_id,
      diff: { input: patch },
    });

    revalidatePath("/dashboard/rooms");
    return { room };
  });
}
