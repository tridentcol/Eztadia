"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Close } from "@/components/icons";

const NAV = [
  { href: "#producto", label: "Producto" },
  { href: "#como", label: "Cómo funciona" },
  { href: "#precios", label: "Pricing" },
  { href: "#demo", label: "Demo" },
];

export function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"ES" | "EN">("ES");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ease-organic",
        scrolled
          ? "bg-cream/90 backdrop-blur-md backdrop-saturate-150 border-b border-rule"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 h-16 lg:h-[72px]">
          <Link href="/" aria-label="Eztadia, inicio" className="inline-flex items-center gap-2 font-serif italic font-medium text-[22px] text-ink tracking-tight">
            <span>Eztadia</span>
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage -translate-y-1.5" />
          </Link>

          <nav aria-label="Principal" className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-soft hover:text-ink transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="justify-self-end inline-flex items-center gap-3 lg:gap-3.5">
            <div role="group" aria-label="Idioma" className="hidden lg:inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.08em] uppercase text-ink-muted">
              {(["ES", "EN"] as const).map((code, i) => (
                <span key={code} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden className="opacity-40">·</span>}
                  <button
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`px-0.5 py-1 rounded transition-colors duration-200 ${
                      lang === code ? "text-ink" : "hover:text-ink"
                    }`}
                  >
                    {code}
                  </button>
                </span>
              ))}
            </div>

            <Link
              href="/login"
              className="hidden lg:inline-flex items-center justify-center h-10 px-[18px] rounded-[14px] text-sm font-medium text-ink hover:bg-linen transition-colors duration-200"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-10 px-[18px] rounded-[14px] text-sm font-medium text-cream bg-terracotta hover:bg-clay active:scale-[0.98] transition-[background-color,transform] duration-200"
            >
              Comenzar gratis
            </Link>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-ink rounded-[10px] hover:bg-linen transition-colors"
            >
              {open ? <Close width={22} height={22} /> : <Menu width={22} height={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-5 -mt-1">
            <nav aria-label="Menú móvil" className="flex flex-col gap-1 border-t border-rule pt-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-serif italic text-[20px] text-ink py-2"
                >
                  {item.label}
                </a>
              ))}
              <Link href="/login" className="text-sm font-medium text-ink-soft mt-3 py-2">
                Iniciar sesión
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
