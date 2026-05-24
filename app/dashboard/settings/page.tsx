import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PersonalSettingsTabsNav,
  PersonalSettingsTabsMobileTrigger,
} from "@/components/personal-settings/SettingsTabs";
import { PersonalSettingsContent } from "@/components/personal-settings/SettingsContent";
import { getPersonalSettings } from "@/lib/personal-settings";
import { getOwnerProfileForSettings } from "@/lib/db/queries/profile";

export const metadata: Metadata = {
  title: "Mi cuenta — Eztadia",
};

export default async function SettingsPage() {
  // Profile: query real desde profiles table.
  // Notifications / language / sessions: demo defaults por ahora — todavia
  // no hay schema para preferences ni sessions tracking. Deuda separada.
  const [realProfile, demo] = await Promise.all([
    getOwnerProfileForSettings(),
    Promise.resolve(getPersonalSettings()),
  ]);
  const data = { ...demo, profile: realProfile };

  return (
    <Suspense fallback={null}>
      <div className="md:grid md:grid-cols-[260px_1fr] min-h-[700px]">
        <PersonalSettingsTabsNav twoFactorEnabled={data.profile.twoFactorEnabled} />
        <div className="px-5 md:px-0">
          <div className="md:hidden pt-6">
            <PersonalSettingsTabsMobileTrigger />
          </div>
          <PersonalSettingsContent data={data} />
        </div>
      </div>
    </Suspense>
  );
}
