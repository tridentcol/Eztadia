"use server";

import { revalidatePath } from "next/cache";
import { updateProfileSchema } from "@/lib/validation/profile";
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
