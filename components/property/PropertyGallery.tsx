"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Close } from "@/components/icons";
import type { Photo } from "@/lib/properties";

const TILE_CLASSES = [
  "col-span-2 row-span-2 lg:col-span-7 lg:row-span-5",
  "col-span-1 row-span-1 lg:col-span-5 lg:row-span-3",
  "col-span-1 row-span-1 lg:col-span-5 lg:row-span-4",
  "col-span-1 row-span-1 lg:col-span-4 lg:row-span-3",
  "col-span-1 row-span-1 lg:col-span-3 lg:row-span-3",
  "col-span-1 row-span-1 lg:col-span-5 lg:row-span-3",
  "col-span-1 row-span-1 lg:col-span-4 lg:row-span-4",
  "col-span-1 row-span-1 lg:col-span-3 lg:row-span-4",
];

export function PropertyGallery({
  photos,
  propertyName,
}: {
  photos: Photo[];
  propertyName?: string;
}) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="mb-20" aria-labelledby="gal-title">
      {propertyName && (
        <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
          {propertyName}
        </span>
      )}
      <h3
        id="gal-title"
        className="font-serif font-medium text-ink m-0 mb-5 tracking-[-0.015em]"
        style={{ fontSize: "clamp(22px, 2.6vw, 28px)", lineHeight: 1.15 }}
      >
        El lugar.
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-12 gap-3" style={{ gridAutoRows: "130px" }}>
        <style>{`
          @media (min-width: 1024px) {
            .gallery-grid { grid-auto-rows: 90px; }
          }
        `}</style>
        {photos.slice(0, 8).map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setLightbox(p)}
            aria-label={`Ver foto: ${p.alt}`}
            className={[
              "relative overflow-hidden bg-linen group",
              TILE_CLASSES[i] ?? "col-span-1 row-span-1",
            ].join(" ")}
            style={{ borderRadius: 16 }}
          >
            <Image
              src={p.src.replace(/w=\d+/, "w=900")}
              alt={p.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-organic group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {photos.length > 8 && (
        <button
          type="button"
          onClick={() => setLightbox(photos[0])}
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-sage border-b border-transparent hover:border-sage transition-colors pb-px"
        >
          Ver las <span className="oldstyle">{photos.length}</span> fotos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 cursor-zoom-out"
          style={{ background: "rgba(31, 27, 22, 0.84)" }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Cerrar"
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-cream text-ink inline-flex items-center justify-center"
          >
            <Close width={18} height={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-full"
            style={{ borderRadius: 16, boxShadow: "var(--shadow-soft)" }}
          />
        </div>
      )}
    </section>
  );
}
