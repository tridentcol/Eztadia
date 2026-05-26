import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { SettingsTabsNav, SettingsTabsMobileTrigger } from "@/components/property-settings/SettingsTabs";
import { SettingsContent } from "@/components/property-settings/SettingsContent";
import { getPropertySettingsFromDb } from "@/lib/db/queries/property-settings";
import { listRoomTypesWithRooms } from "@/lib/db/queries/rooms";
import { getBankAccountByPropertyId } from "@/lib/db/queries/bank-account";
import { getProperty } from "@/lib/db/queries/property";
import { getActivePropertyId } from "@/lib/auth/session";
import type { BankAccountInput } from "@/lib/validation/bank-account";

export const metadata: Metadata = {
  title: "Ajustes — Eztadia",
};

export default async function PropertySettingsPage() {
  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const [settings, roomTypes, bankRow, propertyRow] = await Promise.all([
    getPropertySettingsFromDb(propertyId),
    listRoomTypesWithRooms(propertyId),
    getBankAccountByPropertyId(propertyId),
    getProperty(propertyId),
  ]);
  const totalRooms = roomTypes.reduce((acc, rt) => acc + (rt.rooms?.length ?? 0), 0);

  const bankAccount: BankAccountInput | null = bankRow
    ? {
        holderName: bankRow.holder_name,
        holderDocumentType: bankRow.holder_document_type,
        holderDocumentNumber: bankRow.holder_document_number,
        bankName: bankRow.bank_name,
        accountType: bankRow.account_type,
        accountNumber: bankRow.account_number,
        notes: bankRow.notes ?? "",
      }
    : null;

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
              propertySlug={propertyRow.slug}
              settings={settings}
              totalRooms={totalRooms}
              bankAccount={bankAccount}
            />
          </div>
        </div>
      </Suspense>
    </>
  );
}
