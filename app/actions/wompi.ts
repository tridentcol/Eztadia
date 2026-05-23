"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePropertyRole } from "@/lib/auth/session";
import { upsertWompiConfig, deleteWompiConfig } from "@/lib/db/mutations/wompi";
import { uuid } from "@/lib/validation/common";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

const saveSchema = z.object({
  propertyId: uuid,
  publicKey: z.string().min(8, "Public key requerida."),
  privateKey: z.string().min(8, "Private key requerida."),
  eventsSecret: z.string().min(8, "Events secret requerido."),
  isTestMode: z.boolean(),
});

export async function saveWompiConfigAction(raw: unknown) {
  return run(saveSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");
    await upsertWompiConfig(input);
    await logAudit({
      action: "wompi.config_saved",
      resourceType: "wompi_config",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
      diff: {
        publicKey: input.publicKey.slice(0, 8) + "…",
        isTestMode: input.isTestMode,
      },
    });
    revalidatePath("/dashboard/integrations/wompi");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const };
  });
}

const removeSchema = z.object({ propertyId: uuid });

export async function removeWompiConfigAction(raw: unknown) {
  return run(removeSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");
    await deleteWompiConfig(input.propertyId);
    await logAudit({
      action: "wompi.config_removed",
      resourceType: "wompi_config",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
    });
    revalidatePath("/dashboard/integrations/wompi");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const };
  });
}
