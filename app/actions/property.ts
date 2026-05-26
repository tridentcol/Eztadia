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

/**
 * Elimina una property con TODAS sus dependencias (bookings, holds,
 * rooms, fotos, integrations, bank account, etc.).
 *
 * Defensa multi-capa:
 *  1. requirePropertyRole("owner") — solo owner puede iniciar.
 *  2. confirmSlug en el input — el caller (UI) pide al user typear el
 *     slug exacto antes de habilitar. Si no matchea, error.
 *  3. La SQL function delete_property_cascade verifica is_property_owner
 *     server-side (defense in depth contra calls fuera de la UI).
 *
 * Audit log queda como registro historico (no se borra junto a la
 * property). Tras el borrado, limpia el cookie active_property y
 * redirect al fallback adecuado.
 */
const deletePropertySchema = z.object({
  propertyId: uuid,
  confirmSlug: z.string().min(1, "Confirma escribiendo el slug."),
});

export async function deletePropertyAction(raw: unknown) {
  const result = await run(deletePropertySchema, raw, async ({ propertyId, confirmSlug }) => {
    await requirePropertyRole(propertyId, "owner");

    const supabase = await createClient();
    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .select("id, slug, name")
      .eq("id", propertyId)
      .maybeSingle();
    if (propErr) throw mapDbError(propErr);
    if (!prop) throw mapDbError({ code: "PGRST116" });

    if (prop.slug !== confirmSlug.trim()) {
      return {
        ok: false as const,
        error: "El slug no coincide. Revisalo e intenta de nuevo.",
      };
    }

    const { error: rpcErr } = await supabase.rpc("delete_property_cascade", {
      p_id: propertyId,
    });
    if (rpcErr) throw mapDbError(rpcErr);

    await logAudit({
      action: "property.deleted",
      resourceType: "property",
      resourceId: propertyId,
      diff: { slug: prop.slug, name: prop.name },
    });

    // Limpia el cookie active si apuntaba a la borrada.
    const cookieStore = await cookies();
    const active = cookieStore.get(ACTIVE_PROPERTY_COOKIE)?.value;
    if (active === propertyId) {
      cookieStore.delete(ACTIVE_PROPERTY_COOKIE);
    }

    revalidatePath("/dashboard", "layout");
    return { ok: true as const };
  });

  if (result.ok && "ok" in result.data && result.data.ok) {
    // Despues de borrar: si quedan otras properties, va al dashboard
    // (layout las carga); si no, al onboarding.
    const next = await getFirstAccessibleProperty();
    redirect(next ? "/dashboard" : "/onboarding");
  }
  return result;
}
