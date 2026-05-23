"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  PERSONAL_SETTINGS_TABS,
  type PersonalSettingsTabKey,
} from "@/lib/personal-settings";
import {
  IconUser,
  IconShield,
  IconDesktop,
  IconBell,
  IconGlobe,
  IconCreditCard,
  IconChevronDown,
} from "./icons";

const ICONS: Record<PersonalSettingsTabKey, (p: { className?: string }) => JSX.Element> = {
  profile: IconUser,
  security: IconShield,
  sessions: IconDesktop,
  notifications: IconBell,
  language: IconGlobe,
  billing: IconCreditCard,
};

export function useActiveTab(): PersonalSettingsTabKey {
  const search = useSearchParams();
  const t = search?.get("tab");
  const valid = PERSONAL_SETTINGS_TABS.find((s) => s.key === t);
  return (valid?.key ?? "profile") as PersonalSettingsTabKey;
}

export function PersonalSettingsTabsNav({
  twoFactorEnabled,
}: {
  twoFactorEnabled: boolean;
}) {
  const active = useActiveTab();
  const pathname = usePathname() ?? "/dashboard/settings";

  return (
    <aside
      aria-label="Tabs de configuración personal"
      className="hidden md:flex flex-col py-8 px-4 border-r border-rule bg-cream w-[260px] shrink-0"
    >
      <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark px-3 pb-3.5">
        Tu cuenta
      </span>

      <nav className="flex flex-col gap-0.5">
        {PERSONAL_SETTINGS_TABS.map((tab) => {
          const Icon = ICONS[tab.key];
          const isActive = tab.key === active;
          const showBadge =
            (tab.key === "security" && !twoFactorEnabled) || tab.key === "billing";
          const badgeLabel = tab.key === "security" ? "2FA" : "Pronto";

          return (
            <Link
              key={tab.key}
              href={`${pathname}?tab=${tab.key}`}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={[
                "relative inline-flex items-center gap-3 h-10 px-4 rounded-[10px] text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-linen text-ink before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-[2px] before:h-[22px] before:rounded before:bg-sage"
                  : "text-ink-soft hover:bg-linen hover:text-ink",
              ].join(" ")}
            >
              <Icon className={`w-[17px] h-[17px] ${isActive ? "text-ink" : "text-ink-muted"}`} />
              <span className="flex-1">{tab.label}</span>
              {showBadge && (
                <span className="bg-[rgba(184,146,62,0.14)] text-gold-dark text-[9px] font-semibold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full">
                  {badgeLabel}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function PersonalSettingsTabsMobileTrigger() {
  const active = useActiveTab();
  const router = useRouter();
  const pathname = usePathname() ?? "/dashboard/settings";
  const currentTab = PERSONAL_SETTINGS_TABS.find((t) => t.key === active);
  const Icon = ICONS[active];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${pathname}?tab=${e.target.value}`, { scroll: false });
  }

  return (
    <div className="md:hidden relative mb-6">
      <div className="flex items-center justify-between gap-3 h-12 px-3.5 rounded-xl bg-paper border border-rule text-[14px] font-medium text-ink">
        <span className="inline-flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-sage" />
          {currentTab?.label}
        </span>
        <IconChevronDown className="w-3 h-3 text-ink-muted" />
      </div>
      <select
        value={active}
        onChange={handleChange}
        aria-label="Cambiar tab de configuración"
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {PERSONAL_SETTINGS_TABS.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
