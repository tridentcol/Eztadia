"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/lib/validation/property";
import { uuid } from "@/lib/validation/common";
import {
  createProperty,
  updateProperty,
} from "@/lib/db/mutations/properties";
import { getBookingPolicy } from "@/lib/db/queries/property-settings";
import { createClient } from "@/lib/supabase/server";
import {
  requireProfile,
  requireProperty,
  requirePropertyRole,
  getFirstAccessibleProperty,
  ACTIVE_PROPERTY_COOKIE,
} from "@/lib/auth/session";
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

    // Idempotencia: si el user ya completo onboarding, no re-crear nada.
    // El wizard puede re-disparar el effect en remount/refresh y chocar
    // con properties_slug_key UNIQUE en el segundo intento.
    const existing = await getFirstAccessibleProperty();
    if (existing) {
      return { propertyId: existing, slug: undefined as string | undefined };
    }

    const supabase = await createClient();

    // 1. Crear organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: input.organizationName, owner_id: profile.id })
      .select()
      .maybeSingle();
    if (orgErr || !org) throw mapDbError(orgErr);

    // 2. Crear propiedad (createProperty auto-vincula al owner).
    // Si falla → rollback de la organization recien creada para no dejar
    // huerfanas. Sin transaccion SQL real porque createProperty hace dos
    // inserts (properties + property_users) y enredarlas en una RPC es
    // overkill cuando el caso fallback (slug duplicado) es el unico realista.
    let prop;
    try {
      prop = await createProperty({
        organizationId: org.id,
        slug: input.slug,
        name: input.name,
        city: input.city,
        address: input.address,
      });
    } catch (err) {
      // Best-effort cleanup. Si esto tambien falla, no rompemos el throw
      // original — el user veria el error real del property insert.
      await supabase.from("organizations").delete().eq("id", org.id);
      throw err;
    }

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
    if (patch.contactPhone !== undefined) dbPatch.contact_phone = patch.contactPhone;
    if (patch.country !== undefined) dbPatch.country = patch.country;
    if (patch.timezone !== undefined) dbPatch.timezone = patch.timezone;

    // booking_policy es jsonb compartido por varios tabs. Merge shallow
    // por top-level key para no borrar lo que otro tab persistió.
    if (patch.bookingPolicy !== undefined) {
      const existing = await getBookingPolicy(id);
      dbPatch.booking_policy = { ...existing, ...patch.bookingPolicy };
    }

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

/**
 * Setea la propiedad activa del switcher multi-property (D13).
 * Valida que el user es miembro antes de persistir.
 */
const setActivePropertySchema = z.object({ propertyId: uuid });

export async function setActivePropertyAction(raw: unknown) {
  return run(setActivePropertySchema, raw, async ({ propertyId }) => {
    // requireProperty tira ForbiddenError si no es miembro.
    await requireProperty(propertyId);

    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_PROPERTY_COOKIE, propertyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      path: "/",
    });

    // Revalida todo el segmento dashboard (queries cachean por request, pero
    // layout + pages necesitan recompute).
    revalidatePath("/dashboard", "layout");
    return { propertyId };
  });
}
