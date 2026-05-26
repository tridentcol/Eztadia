"use client";

import { useState } from "react";
import { Plus } from "./PhosphorIcons";
import type { FAQItem } from "@/lib/properties";

export function PropertyFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="mb-20" id="faq" aria-labelledby="faq-title">
      <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Preguntas frecuentes
      </span>
      <h3
        id="faq-title"
        className="font-serif font-medium text-ink m-0 mb-5 tracking-[-0.015em]"
        style={{ fontSize: "clamp(22px, 2.6vw, 28px)", lineHeight: 1.15 }}
      >
        Lo que suelen preguntarnos.
      </h3>

      <ul className="list-none m-0 p-0 mt-3 border-b border-rule">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <li key={item.q} className="border-t border-rule">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-6 py-5 text-left font-serif font-medium text-ink tracking-[-0.01em]"
                style={{ fontSize: 19 }}
              >
                <span>{item.q}</span>
                <span
                  className={`shrink-0 w-[22px] h-[22px] inline-flex items-center justify-center transition-[transform,color] duration-300 ease-organic ${
                    open ? "rotate-45 text-sage" : "text-ink-soft"
                  }`}
                  aria-hidden
                >
                  <Plus className="w-[22px] h-[22px]" />
                </span>
              </button>
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-organic"
                style={{ maxHeight: open ? 240 : 0 }}
              >
                <p className="pt-0 pb-5 text-[15px] leading-[1.65] text-ink-soft max-w-[60ch] m-0">
                  {item.a}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
