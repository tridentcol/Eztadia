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

  // En paralelo: property (gallery + is_active), room_types, wompi config, bank account.
  const [property, roomTypesRes, wompiRes, bankRes] = await Promise.all([
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
    supabase
      .from("bank_accounts")
      .select("id")
      .eq("property_id", propertyId)
      .maybeSingle(),
  ]);

  const roomTypes = roomTypesRes.data ?? [];
  const hasRoomType = roomTypes.length > 0;
  const hasPricing = roomTypes.some((rt) => (rt.base_price_cents ?? 0) > 0);

  const gallery = Array.isArray(property.gallery) ? property.gallery : [];
  const hasPhotos = gallery.length > 0;

  // El item "payments" se completa con CUALQUIERA de los dos metodos: PSE
  // (Wompi activo) o transferencia bancaria. Asi el owner no esta forzado
  // a configurar ambos para terminar el onboarding.
  const hasWompi = Boolean(wompiRes.data?.is_active);
  const hasBank = Boolean(bankRes.data);
  const hasPaymentMethod = hasWompi || hasBank;
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
      label: "Configura cómo cobrarás",
      description: hasWompi
        ? "PSE conectado con Wompi."
        : hasBank
        ? "Transferencia bancaria configurada."
        : "PSE con Wompi o transferencia bancaria — basta con uno.",
      href: hasBank && !hasWompi
        ? "/dashboard/property-settings?tab=payments"
        : "/dashboard/integrations/wompi",
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
