"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/bookings", label: "Reservas" },
  { href: "/dashboard/calendar", label: "Calendario" },
  { href: "/dashboard/rooms", label: "Habitaciones" },
  { href: "/dashboard/pricing", label: "Precios" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/integrations", label: "Integraciones" },
  { href: "/dashboard/property-settings", label: "Configuración" },
];

export function PropertyTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación de la propiedad"
      className="border-b border-rule flex gap-7 overflow-x-auto px-5 lg:px-8"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={[
              "inline-block whitespace-nowrap text-sm font-medium pt-4 pb-3 -mb-px transition-colors border-b-2",
              active
                ? "text-ink border-sage"
                : "text-ink-soft border-transparent hover:text-ink",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
