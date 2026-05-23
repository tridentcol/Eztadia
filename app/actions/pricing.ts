"use server";

import { revalidatePath } from "next/cache";
import {
  seasonalRateSchema,
  updateSeasonalRateSchema,
  deleteSeasonalRateSchema,
} from "@/lib/validation/room";
import {
  createSeasonalRate,
  updateSeasonalRate,
  deleteSeasonalRate,
} from "@/lib/db/mutations/seasonal-rates";
import { createClient } from "@/lib/supabase/server";
import { requirePropertyRole } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";
import { can } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/**
 * seasonal_rates solo tiene room_type_id. Para autorizar necesitamos resolver
 * el property_id (la unidad de RLS / permission). Esta helper lo encuentra
 * desde room_type → property.
 */
async function resolvePropertyIdForRoomType(roomTypeId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("property_id")
    .eq("id", roomTypeId)
    .maybeSingle();
  if (error || !data) throw new ForbiddenError();
  return data.property_id;
}

async function resolvePropertyIdForRate(rateId: string): Promise<{
  propertyId: string;
  roomTypeId: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasonal_rates")
    .select("room_type_id, room_types!inner(property_id)")
    .eq("id", rateId)
    .maybeSingle<{
      room_type_id: string;
      room_types: { property_id: string };
    }>();
  if (error || !data) throw new ForbiddenError();
  return {
    roomTypeId: data.room_type_id,
    propertyId: data.room_types.property_id,
  };
}

export async function createSeasonalRateAction(raw: unknown) {
  return run(seasonalRateSchema, raw, async (input) => {
    const propertyId = await resolvePropertyIdForRoomType(input.roomTypeId);
    const ctx = await requirePropertyRole(propertyId, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const rate = await createSeasonalRate(input);

    await logAudit({
      action: "seasonal_rate.created",
      resourceType: "seasonal_rate",
      resourceId: rate.id,
      propertyId,
      diff: { input },
    });

    revalidatePath("/dashboard/pricing");
    return { rate };
  });
}

export async function updateSeasonalRateAction(raw: unknown) {
  return run(updateSeasonalRateSchema, raw, async (input) => {
    const { id, ...patch } = input;
    const { propertyId } = await resolvePropertyIdForRate(id);
    const ctx = await requirePropertyRole(propertyId, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
    if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate;
    if (patch.priceCents !== undefined) dbPatch.price_cents = patch.priceCents;
    if (patch.priority !== undefined) dbPatch.priority = patch.priority;

    const rate = await updateSeasonalRate(id, dbPatch);

    await logAudit({
      action: "seasonal_rate.updated",
      resourceType: "seasonal_rate",
      resourceId: id,
      propertyId,
      diff: { input: patch },
    });

    revalidatePath("/dashboard/pricing");
    return { rate };
  });
}

export async function deleteSeasonalRateAction(raw: unknown) {
  return run(deleteSeasonalRateSchema, raw, async ({ id }) => {
    const { propertyId } = await resolvePropertyIdForRate(id);
    const ctx = await requirePropertyRole(propertyId, "manager");
    if (!can("room.write", ctx.propertyRole)) throw new ForbiddenError();

    await deleteSeasonalRate(id);

    await logAudit({
      action: "seasonal_rate.deleted",
      resourceType: "seasonal_rate",
      resourceId: id,
      propertyId,
    });

    revalidatePath("/dashboard/pricing");
    return { id };
  });
}
