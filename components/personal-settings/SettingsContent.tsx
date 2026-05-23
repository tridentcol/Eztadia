"use client";

import { useActiveTab } from "./SettingsTabs";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { SessionsTab } from "./tabs/SessionsTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { BillingTab } from "./tabs/BillingTab";
import type { PersonalSettings } from "@/lib/personal-settings";

export function PersonalSettingsContent({ data }: { data: PersonalSettings }) {
  const tab = useActiveTab();

  return (
    <div className="flex-1 min-w-0 px-5 py-10 sm:px-12 sm:py-12 pb-24 max-w-[1100px]">
      {tab === "profile" && <ProfileTab profile={data.profile} />}
      {tab === "security" && <SecurityTab profile={data.profile} />}
      {tab === "sessions" && <SessionsTab sessions={data.sessions} />}
      {tab === "notifications" && <NotificationsTab initial={data.notificationPrefs} />}
      {tab === "language" && <LanguageTab initial={data.language} />}
      {tab === "billing" && <BillingTab />}
    </div>
  );
}
