"use server";

import { revalidatePath } from "next/cache";
import {
  inviteStaffSchema,
  removeStaffSchema,
  updateStaffRoleSchema,
} from "@/lib/validation/user";
import {
  inviteStaff,
  removeStaff,
  updateStaffRole,
} from "@/lib/db/mutations/staff";
import { requirePropertyRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

export async function inviteStaffAction(raw: unknown) {
  return run(inviteStaffSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "owner");
    const link = await inviteStaff(input);
    await logAudit({
      action: "staff.invited",
      resourceType: "property_user",
      resourceId: link.id,
      propertyId: input.propertyId,
      diff: { input },
    });
    revalidatePath("/dashboard/staff");
    return { propertyUser: link };
  });
}

export async function updateStaffRoleAction(raw: unknown) {
  return run(updateStaffRoleSchema, raw, async (input) => {
    // Tenemos que resolver property_id para el guard
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: link } = await supabase
      .from("property_users")
      .select("property_id, role")
      .eq("id", input.propertyUserId)
      .maybeSingle();
    if (!link) throw new Error("Miembro no encontrado.");

    await requirePropertyRole(link.property_id, "owner");
    const updated = await updateStaffRole(input);
    await logAudit({
      action: "staff.role_updated",
      resourceType: "property_user",
      resourceId: input.propertyUserId,
      propertyId: link.property_id,
      diff: { before: { role: link.role }, after: { role: input.role } },
    });
    revalidatePath("/dashboard/staff");
    return { propertyUser: updated };
  });
}

export async function removeStaffAction(raw: unknown) {
  return run(removeStaffSchema, raw, async (input) => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: link } = await supabase
      .from("property_users")
      .select("property_id, user_id, role")
      .eq("id", input.propertyUserId)
      .maybeSingle();
    if (!link) throw new Error("Miembro no encontrado.");

    // Owner saca a otros; cualquier user puede salir por su cuenta.
    const { profile } = await requirePropertyRole(link.property_id, "reception");
    if (link.user_id !== profile.id) {
      await requirePropertyRole(link.property_id, "owner");
    }

    await removeStaff(input.propertyUserId);
    await logAudit({
      action: "staff.removed",
      resourceType: "property_user",
      resourceId: input.propertyUserId,
      propertyId: link.property_id,
      diff: { removed: { user_id: link.user_id, role: link.role } },
    });
    revalidatePath("/dashboard/staff");
    return undefined;
  });
}
