import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import {
  bookingPolicySchema,
  type BookingPolicy,
} from "@/lib/validation/property";
import type { PropertySettings } from "@/lib/property-settings";

/**
 * Lee la propiedad y arma el shape `PropertySettings` que consume el dashboard.
 *
 * Decisiones:
 * - Campos sin columna en `properties` (políticas, toggles avanzados) viven en
 *   `booking_policy` jsonb. Parseado tolerante con defaults.
 * - `type` no existe en DB todavía — devolvemos "hotel" hasta que migremos.
 * - `photos` se lee de `gallery` jsonb cuando exista; mientras no, [] vacío.
 *   Upload real es Phase E6 (Storage buckets), Photos tab muestra placeholder.
 * - `fiscal` no tiene columnas — devolvemos valores neutros para que el tab
 *   se renderice sin crashear pero la UI mostrará "Próximamente".
 */
export async function getPropertySettingsFromDb(
  propertyId: string,
): Promise<PropertySettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, name, slug, address, city, country, timezone, description_es, description_en, amenities, check_in_time, check_out_time, min_stay_nights, max_stay_nights, booking_policy, gallery, is_active",
    )
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Propiedad");

  // booking_policy es jsonb permisivo — validamos para evitar UI crash.
  const parsed = bookingPolicySchema.safeParse(data.booking_policy ?? {});
  const policy: BookingPolicy = parsed.success ? parsed.data : {};

  return {
    general: {
      name: data.name,
      type: "hotel",
      address: data.address ?? "",
      city: data.city ?? "",
      country: data.country ?? "Colombia",
      timezone: data.timezone ?? "America/Bogota",
    },
    identity: {
      descriptionEs: data.description_es ?? "",
      descriptionEn: data.description_en ?? "",
    },
    amenities: { selected: data.amenities ?? [] },
    policies: {
      cancellation: policy.cancellation ?? "moderate",
      pets: policy.pets?.allowed ?? false,
      petsFee: policy.pets?.fee_cents,
      petsRules: policy.pets?.rules,
      children: policy.children?.allowed ?? true,
      childrenFreeAge: policy.children?.free_age_max,
      smoking: policy.smoking?.allowed ?? false,
      smokingAreas: policy.smoking?.areas ?? "",
      events: policy.events?.allowed ?? false,
    },
    schedules: {
      checkIn: data.check_in_time ?? "15:00",
      checkOut: data.check_out_time ?? "12:00",
      earlyCheckIn: policy.schedules?.early_check_in ?? false,
      lateCheckOut: policy.schedules?.late_check_out ?? false,
      minStay: data.min_stay_nights ?? 1,
      maxStayUnlimited: data.max_stay_nights === null,
      maxStay: data.max_stay_nights ?? undefined,
    },
    fiscal: {
      legalName: "",
      taxId: "",
      fiscalAddress: "",
      regime: "comun",
    },
    advanced: {
      showNightlyPrice: policy.advanced?.show_nightly_price ?? true,
      instantBookings: policy.advanced?.instant_bookings ?? true,
      requireIdDocument: policy.advanced?.require_id_document ?? true,
      holdTtlPseMinutes: policy.advanced?.hold_ttl_pse_minutes ?? 15,
      holdTtlManualHours: policy.advanced?.hold_ttl_manual_hours ?? 24,
    },
    photos: Array.isArray(data.gallery)
      ? (data.gallery as { id: string; url: string; alt: string }[])
      : [],
  };
}

/**
 * Devuelve el `booking_policy` actual para aplicar merge en mutations.
 * Caller debe re-validar con bookingPolicySchema antes de persistir.
 */
export async function getBookingPolicy(propertyId: string): Promise<BookingPolicy> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("booking_policy")
    .eq("id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Propiedad");
  const parsed = bookingPolicySchema.safeParse(data.booking_policy ?? {});
  return parsed.success ? parsed.data : {};
}
