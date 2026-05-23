"use server";

import { revalidatePath } from "next/cache";
import { requirePropertyRole } from "@/lib/auth/session";
import {
  createIcalFeed,
  updateIcalFeed,
  deleteIcalFeed,
  getIcalFeedPropertyId,
  regenerateIcalExportSecret,
} from "@/lib/db/mutations/ical";
import {
  createIcalFeedSchema,
  updateIcalFeedSchema,
  deleteIcalFeedSchema,
  regenerateIcalSecretSchema,
} from "@/lib/validation/integrations";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

export async function createIcalFeedAction(raw: unknown) {
  return run(createIcalFeedSchema, raw, async (input) => {
    // ical_feeds_manager_write — manager+ puede gestionar feeds.
    await requirePropertyRole(input.propertyId, "manager");
    const { id } = await createIcalFeed(input);
    await logAudit({
      action: "ical.feed_created",
      resourceType: "ical_feed",
      resourceId: id,
      propertyId: input.propertyId,
      diff: {
        name: input.name,
        direction: input.direction,
        url: input.url,
        roomId: input.roomId,
      },
    });
    revalidatePath("/dashboard/integrations/ical");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const, id };
  });
}

export async function updateIcalFeedAction(raw: unknown) {
  return run(updateIcalFeedSchema, raw, async (input) => {
    const propertyId = await getIcalFeedPropertyId(input.feedId);
    await requirePropertyRole(propertyId, "manager");
    const { feedId, ...patch } = input;
    await updateIcalFeed(feedId, patch);
    await logAudit({
      action: "ical.feed_updated",
      resourceType: "ical_feed",
      resourceId: feedId,
      propertyId,
      diff: patch,
    });
    revalidatePath("/dashboard/integrations/ical");
    return { ok: true as const };
  });
}

export async function deleteIcalFeedAction(raw: unknown) {
  return run(deleteIcalFeedSchema, raw, async (input) => {
    const propertyId = await getIcalFeedPropertyId(input.feedId);
    await requirePropertyRole(propertyId, "manager");
    await deleteIcalFeed(input.feedId);
    await logAudit({
      action: "ical.feed_deleted",
      resourceType: "ical_feed",
      resourceId: input.feedId,
      propertyId,
    });
    revalidatePath("/dashboard/integrations/ical");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const };
  });
}

export async function regenerateIcalSecretAction(raw: unknown) {
  return run(regenerateIcalSecretSchema, raw, async (input) => {
    // Rotación del secret de export — solo owner por seguridad
    // (rota URLs que están en Booking/Airbnb del usuario).
    await requirePropertyRole(input.propertyId, "owner");
    const secret = await regenerateIcalExportSecret(input.propertyId);
    await logAudit({
      action: "ical.export_secret_rotated",
      resourceType: "property",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
    });
    revalidatePath("/dashboard/integrations/ical");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const, secret };
  });
}
