import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PersonalSettingsTabsNav,
  PersonalSettingsTabsMobileTrigger,
} from "@/components/personal-settings/SettingsTabs";
import { PersonalSettingsContent } from "@/components/personal-settings/SettingsContent";
import { getPersonalSettings } from "@/lib/personal-settings";
import {
  getOwnerProfileForSettings,
  getLanguagePrefs,
  getNotificationPrefs,
} from "@/lib/db/queries/profile";

export const metadata: Metadata = {
  title: "Mi cuenta — Eztadia",
};

export default async function SettingsPage() {
  // Profile + language + notifications: queries reales desde profiles.
  // Sessions: demo defaults por ahora — sin schema todavia.
  const [realProfile, realLanguage, realNotifs, demo] = await Promise.all([
    getOwnerProfileForSettings(),
    getLanguagePrefs(),
    getNotificationPrefs(),
    Promise.resolve(getPersonalSettings()),
  ]);
  const data = {
    ...demo,
    profile: realProfile,
    language: realLanguage,
    notificationPrefs: realNotifs,
  };

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
