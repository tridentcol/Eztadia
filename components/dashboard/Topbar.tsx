"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBell, IconMenu, IconSearch } from "./icons";
import type { OwnerSnapshot } from "@/lib/dashboard";

export function Topbar({
  snapshot,
  onOpenDrawer,
  hasNotifications = true,
  breadcrumb,
}: {
  snapshot: OwnerSnapshot;
  onOpenDrawer: () => void;
  hasNotifications?: boolean;
  breadcrumb?: { href?: string; label: string }[];
}) {
  const [lang, setLang] = useState<"ES" | "EN">("ES");

  const crumbs = breadcrumb ?? [
    { href: "/dashboard", label: snapshot.property.name },
    { label: "Resumen" },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-cream border-b border-rule grid items-center gap-3 lg:gap-6 px-4 lg:px-8" style={{ gridTemplateColumns: "auto 1fr auto" }}>
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
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="opacity-50">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div role="search" className="relative w-full max-w-[360px] justify-self-center">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="search"
          placeholder="Buscar reserva, huésped, habitación..."
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
          {hasNotifications && (
            <span
              aria-hidden
              className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-sage border-2 border-cream"
            />
          )}
        </button>

        <div role="group" aria-label="Idioma" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-[0.08em] uppercase text-ink-muted font-medium">
          {(["ES", "EN"] as const).map((code, i) => (
            <span key={code} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="opacity-40">·</span>}
              <button
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`px-0.5 py-1 rounded transition-colors ${
                  lang === code ? "text-ink" : "hover:text-ink"
                }`}
              >
                {code}
              </button>
            </span>
          ))}
        </div>

        <button
          type="button"
          aria-label={`Tu cuenta — ${snapshot.owner.fullName}`}
          title={snapshot.owner.fullName}
          className="w-[34px] h-[34px] rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-[13px] font-medium"
        >
          {snapshot.owner.initials}
        </button>
      </div>
    </header>
  );
}
