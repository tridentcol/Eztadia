import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { listRoomTypes } from "@/lib/db/queries/rooms";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import {
  PricingPageClient,
  type RoomTypePricingView,
} from "@/components/pricing/PricingPageClient";

export const metadata: Metadata = {
  title: "Precios — Eztadia",
};

export default async function PricingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const rows = await listRoomTypes(propertyId);

  // Ordena: activos primero, despues por precio base
  const sorted = [...rows].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    return a.base_price_cents - b.base_price_cents;
  });

  const view: RoomTypePricingView[] = sorted.map((rt) => ({
    id: rt.id,
    nameEs: rt.name_es,
    basePriceCents: rt.base_price_cents,
    isActive: rt.is_active,
    rates: (rt.seasonal_rates ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      startDate: r.start_date,
      endDate: r.end_date,
      priceCents: r.price_cents,
      priority: r.priority,
    })),
  }));

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[1140px] mx-auto px-5 sm:px-12 py-10 sm:py-12"
      >
        <PricingPageClient roomTypes={view} />
      </main>
    </>
  );
}
