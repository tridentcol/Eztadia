"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, XLogo } from "@/components/icons";

const COLS = [
  {
    title: "Producto",
    links: ["Características", "Cómo funciona", "Pricing", "Demo", "Roadmap"],
  },
  {
    title: "Empresa",
    links: ["Sobre Eztadia", "Blog", "Contacto", "Carreras"],
  },
  {
    title: "Legal",
    links: ["Términos", "Privacidad", "Cookies", "Seguridad"],
  },
];

export function Footer() {
  const [lang, setLang] = useState<"Español" | "English">("Español");

  return (
    <footer role="contentinfo" className="bg-ink text-cream pt-20 pb-8">
      <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        <div className="grid gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-serif italic font-medium text-cream tracking-tight" style={{ fontSize: 32 }}>
              <span>Eztadia</span>
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage-soft -translate-y-2" />
            </Link>
            <p className="mt-4 text-sm text-cream/72 max-w-[24ch] leading-[1.5]">
              La forma serena de gestionar habitaciones.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h5 className="text-[12px] font-medium tracking-[0.14em] uppercase text-gold m-0 mb-[18px]">
                {col.title}
              </h5>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-cream/86 hover:text-cream hover:border-b hover:border-cream/32 pb-px transition-colors duration-200"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div aria-hidden className="h-px bg-cream/15 my-12 mb-6" />

        <div className="flex justify-between items-center gap-6 flex-wrap text-[13px] text-cream/60">
          <span>© 2026 Eztadia. Hecho con cuidado en Bogotá.</span>
          <div className="inline-flex items-center gap-4.5">
            <div role="group" aria-label="Idioma" className="inline-flex items-center gap-2">
              {(["Español", "English"] as const).map((label, i) => (
                <span key={label} className="inline-flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="opacity-40">·</span>}
                  <button
                    type="button"
                    onClick={() => setLang(label)}
                    aria-pressed={lang === label}
                    className={`rounded transition-colors duration-200 ${
                      lang === label ? "text-cream" : "text-cream/60 hover:text-cream"
                    }`}
                  >
                    {label}
                  </button>
                </span>
              ))}
            </div>
            <a href="#" aria-label="Instagram" className="text-cream/60 hover:text-cream transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="X" className="text-cream/60 hover:text-cream transition-colors">
              <XLogo className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
