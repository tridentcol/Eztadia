import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { SettingsTabsNav, SettingsTabsMobileTrigger } from "@/components/property-settings/SettingsTabs";
import { SettingsContent } from "@/components/property-settings/SettingsContent";
import { getPropertySettings } from "@/lib/property-settings";
import { getProperty } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Configuración · Casa Marina — Eztadia",
};

export default function PropertySettingsPage() {
  const settings = getPropertySettings();
  const property = getProperty("casa-marina");
  const totalRooms = property?.totalRooms ?? 12;

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
            <SettingsContent settings={settings} totalRooms={totalRooms} />
          </div>
        </div>
      </Suspense>
    </>
  );
}
