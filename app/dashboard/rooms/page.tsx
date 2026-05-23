import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { listRoomTypesWithRooms } from "@/lib/db/queries/rooms";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import {
  RoomsPageClient,
  type RoomTypeView,
} from "@/components/rooms/RoomsPageClient";

export const metadata: Metadata = {
  title: "Habitaciones — Eztadia",
};

export default async function RoomsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const rows = await listRoomTypesWithRooms(propertyId);

  const view: RoomTypeView[] = rows.map((rt) => ({
    id: rt.id,
    nameEs: rt.name_es,
    nameEn: rt.name_en,
    descriptionEs: rt.description_es,
    basePriceCents: rt.base_price_cents,
    capacityAdults: rt.capacity_adults,
    capacityChildren: rt.capacity_children,
    sizeM2: rt.size_m2,
    bedConfiguration: rt.bed_configuration,
    amenities: rt.amenities ?? [],
    isActive: rt.is_active,
    rooms: rt.rooms.map((r) => ({
      id: r.id,
      number: r.number,
      floor: r.floor,
      notes: r.notes,
      isActive: r.is_active,
    })),
  }));

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[1140px] mx-auto px-5 sm:px-12 py-10 sm:py-12"
      >
        <RoomsPageClient propertyId={propertyId} roomTypes={view} />
      </main>
    </>
  );
}
