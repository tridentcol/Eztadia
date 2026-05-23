"use client";

import { useActiveTab } from "./SettingsTabs";
import { GeneralTab } from "./tabs/GeneralTab";
import { IdentityTab } from "./tabs/IdentityTab";
import { PhotosTab } from "./tabs/PhotosTab";
import { AmenitiesTab } from "./tabs/AmenitiesTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { SchedulesTab } from "./tabs/SchedulesTab";
import { FiscalTab } from "./tabs/FiscalTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import type { PropertySettings } from "@/lib/property-settings";

export function SettingsContent({
  settings,
  totalRooms,
}: {
  settings: PropertySettings;
  totalRooms: number;
}) {
  const tab = useActiveTab();

  return (
    <div className="flex-1 min-w-0 px-5 py-10 sm:px-12 sm:py-12 pb-24 max-w-[1080px] overflow-hidden">
      {tab === "general" && <GeneralTab initial={settings.general} totalRooms={totalRooms} />}
      {tab === "identity" && <IdentityTab initial={settings.identity} />}
      {tab === "photos" && <PhotosTab initial={settings.photos} />}
      {tab === "amenities" && <AmenitiesTab initial={settings.amenities} />}
      {tab === "policies" && <PoliciesTab initial={settings.policies} />}
      {tab === "schedules" && <SchedulesTab initial={settings.schedules} />}
      {tab === "fiscal" && <FiscalTab initial={settings.fiscal} />}
      {tab === "advanced" && <AdvancedTab initial={settings.advanced} />}
    </div>
  );
}
