"use server";

import { revalidatePath } from "next/cache";
import {
  updateProfileSchema,
  updateLanguagePrefsSchema,
  updateNotificationPrefsSchema,
} from "@/lib/validation/profile";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/**
 * Actualiza el perfil del user actual: full_name + phone. RLS exige que
 * profile.id = auth.uid() (solo el user mismo puede tocar su perfil).
 *
 * Audit log emitido para trazar cambios de nombre (visible en facturas /
 * emails a huespedes).
 */
export async function updateProfileAction(raw: unknown) {
  return run(updateProfileSchema, raw, async (input) => {
    const profile = await requireProfile();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone,
      })
      .eq("id", profile.id)
      .select()
      .maybeSingle();

    if (error) throw mapDbError(error);

    await logAudit({
      action: "profile.updated",
      resourceType: "profile",
      resourceId: profile.id,
      diff: {
        from: { full_name: profile.full_name, phone: profile.phone },
        to: { full_name: input.fullName, phone: input.phone },
      },
    });

    // Greeting + initials del dashboard dependen de full_name.
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");

    return { profile: data };
  });
}

/**
 * Actualiza preferencias de idioma + formato (locale, date_format,
 * number_format) en profiles. RLS exige id = auth.uid().
 */
export async function updateLanguagePrefsAction(raw: unknown) {
  return run(updateLanguagePrefsSchema, raw, async (input) => {
    const profile = await requireProfile();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        locale: input.language,
        date_format: input.dateFormat,
        number_format: input.numberFormat,
      })
      .eq("id", profile.id);

    if (error) throw mapDbError(error);

    await logAudit({
      action: "profile.language_updated",
      resourceType: "profile",
      resourceId: profile.id,
      diff: {
        to: {
          locale: input.language,
          date_format: input.dateFormat,
          number_format: input.numberFormat,
        },
      },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true as const };
  });
}

/**
 * Actualiza la matriz completa de preferencias de notificaciones. El
 * caller (tab Notifications) envia el shape completo tras cada toggle
 * — mantenemos optimistic UI client-side y persistimos sin merge
 * adicional aqui.
 */
export async function updateNotificationPrefsAction(raw: unknown) {
  return run(updateNotificationPrefsSchema, raw, async (input) => {
    const profile = await requireProfile();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: input.prefs })
      .eq("id", profile.id);

    if (error) throw mapDbError(error);

    revalidatePath("/dashboard/settings");
    return { ok: true as const };
  });
}
