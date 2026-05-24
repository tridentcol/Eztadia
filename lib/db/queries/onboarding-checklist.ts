import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getProperty } from "./property";

export type ChecklistItem = {
  key: "roomType" | "photos" | "pricing" | "payments" | "publish";
  label: string;
  description: string;
  href: string;
  done: boolean;
};

export type ChecklistStatus = {
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  allDone: boolean;
};

/**
 * Computa el estado del onboarding checklist para una propiedad.
 *
 * 5 items que un owner necesita completar tras el wizard inicial para tener
 * una propiedad operativa: room type, fotos, precio, pagos, publicar.
 */
export async function getChecklistStatus(propertyId: string): Promise<ChecklistStatus> {
  const supabase = await createClient();

  // En paralelo: property (gallery + is_active), room_types (count + precio), wompi
  const [property, roomTypesRes, wompiRes] = await Promise.all([
    getProperty(propertyId),
    supabase
      .from("room_types")
      .select("id, base_price_cents")
      .eq("property_id", propertyId),
    supabase
      .from("wompi_configs")
      .select("is_active")
      .eq("property_id", propertyId)
      .maybeSingle(),
  ]);

  const roomTypes = roomTypesRes.data ?? [];
  const hasRoomType = roomTypes.length > 0;
  const hasPricing = roomTypes.some((rt) => (rt.base_price_cents ?? 0) > 0);

  const gallery = Array.isArray(property.gallery) ? property.gallery : [];
  const hasPhotos = gallery.length > 0;

  const hasPaymentMethod = Boolean(wompiRes.data?.is_active);
  const isPublished = property.is_active === true;

  const items: ChecklistItem[] = [
    {
      key: "roomType",
      label: "Crea tu primer tipo de habitación",
      description: "Define capacidad, camas y precio base.",
      href: "/dashboard/rooms",
      done: hasRoomType,
    },
    {
      key: "photos",
      label: "Sube fotos de tu propiedad",
      description: "Mínimo 3 fotos para que tu página pública luzca.",
      href: "/dashboard/property-settings?tab=photos",
      done: hasPhotos,
    },
    {
      key: "pricing",
      label: "Define precios por noche",
      description: "Configura tarifas para cada tipo de habitación.",
      href: "/dashboard/pricing",
      done: hasPricing,
    },
    {
      key: "payments",
      label: "Conecta cobros con PSE",
      description: "Vincula tu cuenta Wompi para recibir pagos en línea.",
      href: "/dashboard/integrations/wompi",
      done: hasPaymentMethod,
    },
    {
      key: "publish",
      label: "Publica tu página pública",
      description: "Activa la propiedad para que reciba reservas.",
      href: "/dashboard/property-settings?tab=general",
      done: isPublished,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  return {
    items,
    completedCount,
    totalCount,
    allDone: completedCount === totalCount,
  };
}
