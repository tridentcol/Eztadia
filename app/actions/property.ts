"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/lib/validation/property";
import {
  createProperty,
  updateProperty,
} from "@/lib/db/mutations/properties";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requirePropertyRole } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { mapDbError } from "@/lib/errors";
import { run } from "./_helpers";

/**
 * Onboarding: crea organization + property + property_user(owner) en cascada.
 * El user actual queda como owner de su primera propiedad.
 */
export async function createPropertyOnboardingAction(raw: unknown) {
  const result = await run(createPropertySchema, raw, async (input) => {
    const profile = await requireProfile();
    const supabase = await createClient();

    // 1. Crear organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: input.organizationName, owner_id: profile.id })
      .select()
      .maybeSingle();
    if (orgErr || !org) throw mapDbError(orgErr);

    // 2. Crear propiedad (createProperty auto-vincula al owner)
    const prop = await createProperty({
      organizationId: org.id,
      slug: input.slug,
      name: input.name,
      city: input.city,
      address: input.address,
    });

    await logAudit({
      action: "property.created",
      resourceType: "property",
      resourceId: prop.id,
      propertyId: prop.id,
      diff: { input },
    });

    revalidatePath("/dashboard");
    return { propertyId: prop.id, slug: prop.slug };
  });

  if (result.ok) redirect("/dashboard");
  return result;
}

export async function updatePropertyAction(raw: unknown) {
  return run(updatePropertySchema, raw, async (input) => {
    await requirePropertyRole(input.id, "owner");
    const { id, ...patch } = input;

    // Convert keys camelCase → snake_case para la mutation
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.slug !== undefined) dbPatch.slug = patch.slug;
    if (patch.city !== undefined) dbPatch.city = patch.city;
    if (patch.address !== undefined) dbPatch.address = patch.address;
    if (patch.descriptionEs !== undefined) dbPatch.description_es = patch.descriptionEs;
    if (patch.descriptionEn !== undefined) dbPatch.description_en = patch.descriptionEn;
    if (patch.amenities !== undefined) dbPatch.amenities = patch.amenities;
    if (patch.checkInTime !== undefined) dbPatch.check_in_time = patch.checkInTime;
    if (patch.checkOutTime !== undefined) dbPatch.check_out_time = patch.checkOutTime;
    if (patch.minStayNights !== undefined) dbPatch.min_stay_nights = patch.minStayNights;
    if (patch.maxStayNights !== undefined) dbPatch.max_stay_nights = patch.maxStayNights;
    if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;

    const updated = await updateProperty(id, dbPatch);
    await logAudit({
      action: "property.updated",
      resourceType: "property",
      resourceId: id,
      propertyId: id,
      diff: { input: patch },
    });
    revalidatePath("/dashboard/property-settings");
    revalidatePath(`/p/${updated.slug}`);
    return { property: updated };
  });
}
