"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProperty, requirePropertyRole } from "@/lib/auth/session";
import {
  upsertWhatsAppConfig,
  deleteWhatsAppConfig,
  markConversationAsRead,
} from "@/lib/db/mutations/whatsapp";
import {
  saveWhatsAppSchema,
  removeWhatsAppSchema,
} from "@/lib/validation/integrations";
import { uuid } from "@/lib/validation/common";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

export async function saveWhatsAppConfigAction(raw: unknown) {
  return run(saveWhatsAppSchema, raw, async (input) => {
    // whatsapp_configs_owner_write — solo owner puede tocar la config.
    await requirePropertyRole(input.propertyId, "owner");
    const tokenIn = input.accessToken && input.accessToken.length > 0
      ? input.accessToken
      : null;
    await upsertWhatsAppConfig({
      propertyId: input.propertyId,
      businessAccountId: input.businessAccountId,
      phoneNumberId: input.phoneNumberId,
      accessToken: tokenIn,
      isActive: input.isActive,
    });
    await logAudit({
      action: "whatsapp.config_saved",
      resourceType: "whatsapp_config",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
      diff: {
        businessAccountId: input.businessAccountId,
        phoneNumberId: input.phoneNumberId,
        isActive: input.isActive,
        tokenRotated: tokenIn !== null,
      },
    });
    revalidatePath("/dashboard/integrations/whatsapp");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const };
  });
}

export async function removeWhatsAppConfigAction(raw: unknown) {
  return run(removeWhatsAppSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "owner");
    await deleteWhatsAppConfig(input.propertyId);
    await logAudit({
      action: "whatsapp.config_removed",
      resourceType: "whatsapp_config",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
    });
    revalidatePath("/dashboard/integrations/whatsapp");
    revalidatePath("/dashboard/integrations");
    return { ok: true as const };
  });
}

/**
 * Marca todos los mensajes inbound de una conversacion como leidos.
 * Disparado server-side cuando el owner abre /dashboard/messages?phone=X.
 * RLS exige acceso al property; cualquier role del staff puede marcar.
 */
const markReadSchema = z.object({
  propertyId: uuid,
  counterpartPhone: z.string().regex(/^\+\d{8,15}$/, "Telefono invalido."),
});

export async function markConversationReadAction(raw: unknown) {
  return run(markReadSchema, raw, async (input) => {
    await requireProperty(input.propertyId);
    const updated = await markConversationAsRead(
      input.propertyId,
      input.counterpartPhone,
    );
    if (updated > 0) {
      revalidatePath("/dashboard/messages");
      revalidatePath("/dashboard", "layout");
    }
    return { ok: true as const, marked: updated };
  });
}
