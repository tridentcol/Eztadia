"use client";

import { useActiveTab } from "./SettingsTabs";
import { GeneralTab } from "./tabs/GeneralTab";
import { IdentityTab } from "./tabs/IdentityTab";
import { PhotosTab } from "./tabs/PhotosTab";
import { AmenitiesTab } from "./tabs/AmenitiesTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { SchedulesTab } from "./tabs/SchedulesTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { FiscalTab } from "./tabs/FiscalTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import type { PropertySettings } from "@/lib/property-settings";
import type { BankAccountInput } from "@/lib/validation/bank-account";

export function SettingsContent({
  propertyId,
  propertySlug,
  settings,
  totalRooms,
  bankAccount,
}: {
  propertyId: string;
  propertySlug: string;
  settings: PropertySettings;
  totalRooms: number;
  bankAccount: BankAccountInput | null;
}) {
  const tab = useActiveTab();

  return (
    <div className="flex-1 min-w-0 px-5 py-10 sm:px-12 sm:py-12 pb-24 max-w-[1080px] overflow-hidden">
      {tab === "general" && <GeneralTab propertyId={propertyId} initial={settings.general} totalRooms={totalRooms} />}
      {tab === "identity" && <IdentityTab propertyId={propertyId} initial={settings.identity} />}
      {tab === "photos" && <PhotosTab propertyId={propertyId} initial={settings.photos} />}
      {tab === "amenities" && <AmenitiesTab propertyId={propertyId} initial={settings.amenities} />}
      {tab === "policies" && <PoliciesTab propertyId={propertyId} initial={settings.policies} />}
      {tab === "schedules" && <SchedulesTab propertyId={propertyId} initial={settings.schedules} />}
      {tab === "payments" && <PaymentsTab propertyId={propertyId} initial={bankAccount} />}
      {tab === "fiscal" && <FiscalTab initial={settings.fiscal} />}
      {tab === "advanced" && (
        <AdvancedTab
          propertyId={propertyId}
          propertySlug={propertySlug}
          initial={settings.advanced}
        />
      )}
    </div>
  );
}
