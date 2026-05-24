"use client";

import { useState, type ReactNode, type JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChartLine,
  IconUsers,
  IconHouse,
  IconReceipt,
  IconClipboard,
  IconMail,
  IconChatCircle,
  IconLightning,
  IconBug,
  IconGear,
  IconArrowLeft,
  IconSearch,
  IconBell,
  IconMenu,
} from "./icons";

type IconCmp = (p: { className?: string }) => JSX.Element;

const SECTIONS: { label: string; items: { href: string; label: string; Icon: IconCmp; badge?: number }[] }[] = [
  {
    label: "Panorama",
    items: [
      { href: "/admin", label: "Resumen", Icon: IconChartLine },
      { href: "/admin/users", label: "Usuarios", Icon: IconUsers },
      { href: "/admin/properties", label: "Propiedades", Icon: IconHouse },
      { href: "/admin/bookings", label: "Reservas", Icon: IconReceipt },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/audit-logs", label: "Audit logs", Icon: IconClipboard },
      { href: "/admin/emails", label: "Emails", Icon: IconMail },
      { href: "/admin/whatsapp", label: "WhatsApp", Icon: IconChatCircle },
      { href: "/admin/webhooks", label: "Webhooks", Icon: IconLightning },
      { href: "/admin/errors", label: "Errores", Icon: IconBug },
    ],
  },
  {
    label: "Cuenta",
    items: [{ href: "/dashboard/settings", label: "Mi cuenta", Icon: IconGear }],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] min-h-screen">
      <AdminSidebar
        mobileOpen={drawerOpen}
        onMobileClose={() => setDrawerOpen(false)}
      />

      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden
        className={`lg:hidden fixed inset-0 z-[90] transition-opacity duration-300 ease-organic ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.4)" }}
      />

      <div className="min-w-0">
        <AdminTopbar onOpenDrawer={() => setDrawerOpen(true)} />
        {children}
      </div>
    </div>
  );
}

function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      aria-label="Navegación admin"
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
        className="inline-flex items-center gap-2 px-2 py-1.5 mb-5 font-serif italic font-medium tracking-tight text-ink relative"
        style={{ fontSize: 22 }}
      >
        Eztadia
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold -mt-2.5" />
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold -mt-2.5 -ml-1" />
        <span
          aria-hidden
          className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-[0.12em] uppercase text-gold-dark bg-[rgba(184,146,62,0.14)] border border-[rgba(184,146,62,0.22)] not-italic"
          style={{ marginTop: "2px" }}
        >
          Admin
        </span>
      </Link>

      {SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted px-3.5 pt-1 pb-2">
            {section.label}
          </span>
          {section.items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.Icon;
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
                {item.badge && (
                  <span className="bg-[rgba(199,111,76,0.12)] text-clay text-[9px] font-semibold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full border border-[rgba(199,111,76,0.22)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="flex-1" />

      <Link
        href="/dashboard"
        onClick={onMobileClose}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] text-ink-soft hover:bg-linen hover:text-ink transition-colors border-t border-rule pt-4 mt-2"
      >
        <IconArrowLeft className="w-3.5 h-3.5" />
        Volver a mi propiedad
      </Link>

      <button
        type="button"
        className="w-full flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-xl hover:bg-linen transition-colors text-left"
      >
        <span
          aria-hidden
          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[13px] font-medium"
          style={{
            background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
            color: "var(--color-gold-dark)",
            border: "1px solid rgba(184,146,62,0.22)",
          }}
        >
          CS
        </span>
        <span className="flex-1 min-w-0 text-[13px] font-medium text-ink truncate">Carlos</span>
      </button>
    </aside>
  );
}

function AdminTopbar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  return (
    <header
      className="sticky top-0 z-20 h-16 bg-cream grid items-center gap-3 lg:gap-6 px-4 lg:px-8"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        borderBottom: "1px solid var(--color-gold-line, rgba(184,146,62,0.32))",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Abrir menú"
          className="lg:hidden w-[38px] h-[38px] rounded-[10px] text-ink hover:bg-linen inline-flex items-center justify-center transition-colors"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <nav aria-label="Migas de pan" className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-ink-muted">
          <span
            className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.1em] uppercase text-gold-dark border"
            style={{
              background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
              borderColor: "rgba(184,146,62,0.22)",
            }}
          >
            Admin
          </span>
          <span aria-hidden className="opacity-50">/</span>
          <span className="text-ink font-medium">Resumen</span>
        </nav>
      </div>

      <div role="search" className="relative w-full max-w-[360px] justify-self-center">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="search"
          placeholder="Buscar usuario, propiedad, evento..."
          aria-label="Buscar"
          className="w-full h-[38px] pl-10 pr-3.5 bg-linen border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:bg-paper focus:border-rule-strong transition-colors"
        />
      </div>

      <div className="justify-self-end inline-flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative w-[38px] h-[38px] rounded-[10px] text-ink-soft hover:text-ink hover:bg-linen inline-flex items-center justify-center transition-colors"
        >
          <IconBell className="w-[18px] h-[18px]" />
        </button>

        <span
          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.1em] uppercase text-gold-dark border"
          style={{
            background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
            borderColor: "rgba(184,146,62,0.22)",
          }}
        >
          Admin
        </span>

        <button
          type="button"
          aria-label="Tu cuenta — Carlos San Juan"
          title="Carlos San Juan"
          className="w-[34px] h-[34px] rounded-full text-[13px] font-medium inline-flex items-center justify-center"
          style={{
            background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
            color: "var(--color-gold-dark)",
            border: "1px solid rgba(184,146,62,0.22)",
          }}
        >
          CS
        </button>
      </div>
    </header>
  );
}
