"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHouse,
  IconCalendar,
  IconReceipt,
  IconChat,
  IconDoor,
  IconDollar,
  IconUsers,
  IconPuzzle,
  IconGear,
  IconChevronDown,
  IconPlus,
  IconUser,
  IconHelp,
  IconLogout,
} from "./icons";
import type { OwnerSnapshot } from "@/lib/dashboard";

type IconCmp = (p: { className?: string }) => JSX.Element;

const SECTIONS: { label: string; items: { href: string; label: string; Icon: IconCmp; badgeKey?: "unread" }[] }[] = [
  {
    label: "Operación",
    items: [
      { href: "/dashboard", label: "Resumen", Icon: IconHouse },
      { href: "/dashboard/calendar", label: "Calendario", Icon: IconCalendar },
      { href: "/dashboard/bookings", label: "Reservas", Icon: IconReceipt },
      { href: "/dashboard/messages", label: "Mensajes", Icon: IconChat, badgeKey: "unread" },
    ],
  },
  {
    label: "Propiedad",
    items: [
      { href: "/dashboard/rooms", label: "Habitaciones", Icon: IconDoor },
      { href: "/dashboard/pricing", label: "Precios", Icon: IconDollar },
      { href: "/dashboard/staff", label: "Staff", Icon: IconUsers },
      { href: "/dashboard/integrations", label: "Integraciones", Icon: IconPuzzle },
    ],
  },
  {
    label: "Cuenta",
    items: [{ href: "/dashboard/settings", label: "Configuración", Icon: IconGear }],
  },
];

export function Sidebar({
  snapshot,
  mobileOpen,
  onMobileClose,
}: {
  snapshot: OwnerSnapshot;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [propOpen, setPropOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const propRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (propRef.current && !propRef.current.contains(e.target as Node)) setPropOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <aside
      aria-label="Navegación principal"
      className={[
        "bg-cream border-r border-rule p-4 flex flex-col overflow-y-auto",
        "lg:sticky lg:top-0 lg:h-screen lg:w-[240px]",
        "fixed inset-y-0 left-0 z-[100] w-[280px] transition-transform duration-300 ease-organic",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <Link
        href="/"
        onClick={onMobileClose}
        className="inline-flex items-center gap-2 px-2 py-1.5 mb-5 font-serif italic font-medium tracking-tight text-ink"
        style={{ fontSize: 22 }}
      >
        Eztadia
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold -mt-2.5" />
      </Link>

      {/* Property switcher — wrapper holds positioning; trigger button is a leaf */}
      <div ref={propRef} className="relative mb-7">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={propOpen}
          aria-controls="prop-menu"
          onClick={() => setPropOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-linen transition-colors"
        >
          <span
            aria-hidden
            className="w-8 h-8 rounded-lg shrink-0 border border-rule bg-cover bg-center"
            style={{ backgroundImage: `url('${snapshot.property.photo}')` }}
          />
          <span className="flex-1 min-w-0 font-serif italic font-medium text-ink text-[15px] truncate">
            {snapshot.property.name}
          </span>
          <IconChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
        </button>

        {propOpen && (
          <div
            id="prop-menu"
            role="menu"
            aria-label="Tus propiedades"
            className="absolute top-full left-0 right-0 mt-1 bg-paper border border-rule rounded-xl p-2 z-30"
            style={{ boxShadow: "var(--shadow-pop, var(--shadow-soft))" }}
          >
            <Link
              href={`/dashboard`}
              role="menuitem"
              onClick={() => setPropOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-linen transition-colors"
            >
              <span
                aria-hidden
                className="w-7 h-7 rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url('${snapshot.property.photo}')` }}
              />
              <span className="text-[13px] font-medium text-ink">
                {snapshot.property.name}
                <span className="text-ink-muted font-normal"> · {snapshot.property.city}</span>
              </span>
            </Link>
            <div aria-hidden className="h-px bg-rule mx-1 my-1.5" />
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-linen transition-colors text-left"
            >
              <span
                aria-hidden
                className="w-7 h-7 rounded-md inline-flex items-center justify-center bg-sage-tint"
              >
                <IconPlus className="w-3.5 h-3.5 text-sage" />
              </span>
              <span className="text-[13px] font-medium text-sage">Crear nueva propiedad</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav sections */}
      {SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted px-3.5 pt-1 pb-2">
            {section.label}
          </span>
          {section.items.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.Icon;
            const badge =
              item.badgeKey === "unread" && snapshot.unreadMessages > 0
                ? snapshot.unreadMessages
                : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm transition-colors mb-0.5",
                  active
                    ? "bg-sage-tint text-sage font-medium before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:rounded before:bg-sage"
                    : "text-ink-soft hover:bg-linen hover:text-ink",
                ].join(" ")}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-sage" : "text-ink-soft"}`} />
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span className="bg-sage text-cream text-[11px] font-medium px-1.5 py-px rounded-full leading-snug">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="flex-1" />

      {/* User trigger — wrapper relative, trigger button is leaf, menu is sibling */}
      <div ref={userRef} className="relative mt-3">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={userOpen}
          aria-controls="user-menu"
          onClick={() => setUserOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-linen transition-colors"
        >
          <span
            aria-hidden
            className="w-9 h-9 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-[13px] font-medium shrink-0"
          >
            {snapshot.owner.initials}
          </span>
          <span className="flex-1 min-w-0 text-[13px] font-medium text-ink truncate">
            {snapshot.owner.firstName}
          </span>
          <IconChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0" />
        </button>
        {userOpen && (
          <div
            id="user-menu"
            role="menu"
            className="absolute bottom-full left-0 right-0 mb-1.5 bg-paper border border-rule rounded-xl p-2 z-30"
            style={{ boxShadow: "var(--shadow-pop, var(--shadow-soft))" }}
          >
            <Link href="/dashboard/settings" role="menuitem" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-linen text-[13px] text-ink transition-colors">
              <IconUser className="w-3.5 h-3.5" />
              Mi perfil
            </Link>
            <a href="#" role="menuitem" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-linen text-[13px] text-ink transition-colors">
              <IconHelp className="w-3.5 h-3.5" />
              Ayuda
            </a>
            <div aria-hidden className="h-px bg-rule mx-1 my-1.5" />
            <button type="button" role="menuitem" className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-linen text-[13px] text-terracotta transition-colors text-left">
              <IconLogout className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
