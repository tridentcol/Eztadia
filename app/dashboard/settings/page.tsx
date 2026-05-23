import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PersonalSettingsTabsNav,
  PersonalSettingsTabsMobileTrigger,
} from "@/components/personal-settings/SettingsTabs";
import { PersonalSettingsContent } from "@/components/personal-settings/SettingsContent";
import { getPersonalSettings } from "@/lib/personal-settings";

export const metadata: Metadata = {
  title: "Configuración personal — Eztadia",
};

export default function SettingsPage() {
  const data = getPersonalSettings();

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
