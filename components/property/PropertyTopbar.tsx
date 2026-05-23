"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function PropertyTopbar({ propertyName }: { propertyName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"ES" | "EN">("ES");

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
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" aria-label={`${propertyName}, inicio`} className="inline-flex items-center gap-2 font-serif italic font-medium text-ink tracking-tight" style={{ fontSize: 18 }}>
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>{propertyName}</span>
        </Link>

        <div className="inline-flex items-center gap-4 text-[13px] text-ink-soft">
          <div role="group" aria-label="Idioma" className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.08em] uppercase text-ink-muted">
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
          <a href="#contact" className="hidden sm:inline text-ink-soft hover:text-ink transition-colors">
            Contacto
          </a>
        </div>
      </div>
    </header>
  );
}
