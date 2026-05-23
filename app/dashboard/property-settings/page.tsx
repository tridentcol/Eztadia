import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { SettingsTabsNav, SettingsTabsMobileTrigger } from "@/components/property-settings/SettingsTabs";
import { SettingsContent } from "@/components/property-settings/SettingsContent";
import { getPropertySettingsFromDb } from "@/lib/db/queries/property-settings";
import { listRoomTypesWithRooms } from "@/lib/db/queries/rooms";
import { getActivePropertyId } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Configuración — Eztadia",
};

export default async function PropertySettingsPage() {
  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const [settings, roomTypes] = await Promise.all([
    getPropertySettingsFromDb(propertyId),
    listRoomTypesWithRooms(propertyId),
  ]);
  const totalRooms = roomTypes.reduce((acc, rt) => acc + (rt.rooms?.length ?? 0), 0);

  return (
    <>
      <PropertyTabs />

      <Suspense fallback={null}>
        <div className="md:grid md:grid-cols-[260px_1fr] min-h-[700px]">
          <SettingsTabsNav />
          <div className="px-5 md:px-0">
            <div className="md:hidden pt-6">
              <SettingsTabsMobileTrigger />
            </div>
            <SettingsContent
              propertyId={propertyId}
              settings={settings}
              totalRooms={totalRooms}
            />
          </div>
        </div>
      </Suspense>
    </>
  );
}
