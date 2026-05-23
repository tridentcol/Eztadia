"use client";

import type { JSX } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SETTINGS_TABS, type SettingsTabKey } from "@/lib/property-settings";
import {
  IconHouse,
  IconIdentity,
  IconPhotos,
  IconAmenities,
  IconPolicies,
  IconClock,
  IconReceipt,
  IconGear,
  IconChevronDown,
} from "./icons";

const ICONS: Record<SettingsTabKey, (p: { className?: string }) => JSX.Element> = {
  general: IconHouse,
  identity: IconIdentity,
  photos: IconPhotos,
  amenities: IconAmenities,
  policies: IconPolicies,
  schedules: IconClock,
  fiscal: IconReceipt,
  advanced: IconGear,
};

export function useActiveTab(): SettingsTabKey {
  const search = useSearchParams();
  const t = search?.get("tab");
  const valid = SETTINGS_TABS.find((s) => s.key === t);
  return (valid?.key ?? "general") as SettingsTabKey;
}

export function SettingsTabsNav() {
  const active = useActiveTab();
  const pathname = usePathname() ?? "/dashboard/property-settings";

  return (
    <aside
      aria-label="Tabs de configuración"
      className="hidden md:flex flex-col py-8 px-4 border-r border-rule bg-cream w-[260px] shrink-0"
    >
      <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark px-3 pb-3.5">
        Tu propiedad
      </span>

      <nav className="flex flex-col gap-0.5">
        {SETTINGS_TABS.map((tab) => {
          const Icon = ICONS[tab.key];
          const isActive = tab.key === active;
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
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function SettingsTabsMobileTrigger() {
  const active = useActiveTab();
  const router = useRouter();
  const pathname = usePathname() ?? "/dashboard/property-settings";
  const currentTab = SETTINGS_TABS.find((t) => t.key === active);
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
        {SETTINGS_TABS.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
