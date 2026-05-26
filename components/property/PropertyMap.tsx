"use client";

import { useState } from "react";
import { Copy, MapPin } from "./PhosphorIcons";
import type { Property } from "@/lib/properties";

export function PropertyMap({ property }: { property: Property }) {
  const [copied, setCopied] = useState(false);

  const fullAddress = [
    property.address,
    property.neighborhood &&
      property.neighborhood.toLowerCase() !== property.city.toLowerCase()
      ? property.neighborhood
      : null,
    property.city,
  ]
    .filter(Boolean)
    .join(", ");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(`${property.address}, ${property.city}`)}`;
  const hasCoords = property.coords.lat !== 0 || property.coords.lng !== 0;
  // Static map (OpenStreetMap, no auth required). Swap to Mapbox Static for production:
  // https://api.mapbox.com/styles/v1/mapbox/light-v11/static/<lng>,<lat>,15/600x320?access_token=...
  const staticMapSrc = hasCoords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${property.coords.lat},${property.coords.lng}&zoom=16&size=600x320&maptype=mapnik`
    : null;

  return (
    <section className="mb-20" aria-labelledby="practical-title">
      <span id="practical-title" className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Información práctica
      </span>

      <div
        className={`grid grid-cols-1 ${
          hasCoords ? "md:grid-cols-2" : ""
        } gap-8 items-start`}
      >
        {hasCoords && staticMapSrc && (
          <div
            className="relative overflow-hidden border border-rule"
            style={{ height: 320, borderRadius: 20, background: "#E8E2D1" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={staticMapSrc}
              alt={`Mapa de ${property.city} mostrando la ubicación de ${property.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2"
              style={{ transform: "translate(-50%, -100%)", width: 32, height: 40, pointerEvents: "none" }}
            >
              <svg viewBox="0 0 32 40" fill="none" style={{ filter: "drop-shadow(0 4px 6px rgba(31,27,22,.25))" }}>
                <path
                  d="M16 39.5 C 7 28, 2 22, 2 14 A 14 14 0 0 1 30 14 C 30 22, 25 28, 16 39.5 Z"
                  fill="#C76F4C"
                  stroke="#A85A3B"
                  strokeWidth={1.2}
                />
                <circle cx={16} cy={14} r={4.5} fill="#FBF8F2" />
              </svg>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <Row label="Llegada">
            Check-in desde las <span className="oldstyle">{property.checkIn}</span>. Te recibe nuestro equipo en recepción.
          </Row>
          <Row label="Salida">
            Check-out hasta las <span className="oldstyle">{property.checkOut}</span>. Equipaje en custodia si lo necesitas.
          </Row>
          <Row label="Dirección">
            <>
              {fullAddress}
              <div className="inline-flex gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream border border-rule text-[12px] font-medium text-ink-soft hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
                >
                  {copied ? (
                    "✓ Copiado"
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </button>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream border border-rule text-[12px] font-medium text-ink-soft hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Abrir en Maps
                </a>
              </div>
            </>
          </Row>
          <Row label="Estancia mínima">
            <span className="oldstyle">{property.minStay}</span> noches
          </Row>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-1.5">
        {label}
      </span>
      <div className="text-[15px] text-ink leading-[1.55]">{children}</div>
    </div>
  );
}
