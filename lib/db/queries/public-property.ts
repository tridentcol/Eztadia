import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Amenity, Property, RoomType, Photo } from "@/lib/properties";

type GalleryItem = { id?: string; url: string; alt?: string; path?: string };

/**
 * Carga la propiedad publica por slug con sus room_types activos y conteo
 * de rooms por tipo (para `units`). RLS anon permite SELECT cuando
 * `is_active = true`; si no esta activa o no existe, devolvemos null y el
 * caller hace notFound().
 *
 * Campos sin columna en DB (rating, reviewCount, type, neighborhood,
 * responseTime, coords, faq, blockedDates) reciben defaults seguros — la UI
 * los renderiza con valores neutros hasta que tengamos schema para cada uno
 * (sistema de reviews, FAQs editables, geocoding, etc.).
 */
export async function getPublicPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      slug, name, city, address, description_es, amenities, gallery,
      check_in_time, check_out_time, min_stay_nights, is_active,
      room_types ( id, name_es, description_es, base_price_cents,
                   capacity_adults, capacity_children, size_m2,
                   bed_configuration, amenities, gallery, is_active,
                   rooms ( id, is_active ) )
      `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) return null;

  const photos: Photo[] = parseGallery(data.gallery).map((g) => ({
    src: g.url,
    alt: g.alt ?? data.name,
  }));

  const activeRoomTypes = (data.room_types ?? []).filter((rt) => rt.is_active);
  const rooms: RoomType[] = activeRoomTypes.map((rt) =>
    roomTypeFromDb(rt, rt.rooms ?? []),
  );

  const totalRooms = activeRoomTypes.reduce(
    (acc, rt) => acc + (rt.rooms ?? []).filter((r) => r.is_active).length,
    0,
  );

  return {
    slug: data.slug,
    name: data.name,
    type: "Alojamiento",
    city: data.city ?? "",
    neighborhood: data.city ?? "",
    address: data.address ?? "",
    rating: 0,
    reviewCount: 0,
    totalRooms,
    checkIn: timeShort(data.check_in_time),
    checkOut: timeShort(data.check_out_time),
    minStay: data.min_stay_nights,
    responseTime: "<24 horas",
    description: data.description_es ?? "",
    amenities: (data.amenities ?? []).filter(isAmenity),
    rooms,
    photos,
    faq: [],
    coords: { lat: 0, lng: 0 },
    blockedDates: [],
  };
}

/**
 * Slugs publicos activos. Util si en el futuro restauramos
 * generateStaticParams; hoy /p/[slug] es full dynamic.
 */
export async function getActivePublicSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug")
    .eq("is_active", true);
  if (error) throw mapDbError(error);
  return (data ?? []).map((r) => r.slug);
}

type RoomTypeDbRow = {
  id: string;
  name_es: string;
  description_es: string | null;
  base_price_cents: number;
  capacity_adults: number;
  capacity_children: number;
  size_m2: number | null;
  bed_configuration: string | null;
  amenities: string[] | null;
  gallery: unknown;
  is_active: boolean;
};

function roomTypeFromDb(
  rt: RoomTypeDbRow,
  roomRows: { id: string; is_active: boolean }[],
): RoomType {
  const gallery = parseGallery(rt.gallery);
  const first = gallery[0];
  const units = roomRows.filter((r) => r.is_active).length;

  return {
    id: rt.id,
    name: rt.name_es,
    beds: rt.bed_configuration ?? "Configuración disponible al reservar",
    capacity: rt.capacity_adults + rt.capacity_children,
    area: rt.size_m2 ?? 0,
    basePriceCOP: Math.round(rt.base_price_cents / 100),
    description: rt.description_es ?? "",
    units,
    amenities: rt.amenities ?? [],
    photo: first
      ? { src: first.url, alt: first.alt ?? rt.name_es }
      : { src: "", alt: rt.name_es },
  };
}

function parseGallery(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (g): g is GalleryItem =>
      typeof g === "object" &&
      g !== null &&
      "url" in g &&
      typeof (g as { url: unknown }).url === "string",
  );
}

function timeShort(t: string | null | undefined): string {
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

const AMENITY_VALUES: Amenity[] = [
  "wifi",
  "ac",
  "pool",
  "breakfast",
  "parking",
  "reception",
  "patio",
  "laundry",
];
const AMENITY_SET = new Set<string>(AMENITY_VALUES);

function isAmenity(value: string): value is Amenity {
  return AMENITY_SET.has(value);
}
