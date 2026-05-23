"use client";

import Image from "next/image";
import { useBooking } from "./BookingProvider";
import { formatCOP, isoDate } from "@/lib/format";
import { Star } from "./PhosphorIcons";
import type { RoomType } from "@/lib/properties";

export function PropertyRooms() {
  const { property, checkIn, checkOut, nights } = useBooking();
  const dated = Boolean(checkIn && checkOut && nights > 0);

  // Compute which rooms are unavailable for the selected range — demo logic:
  // a room is unavailable if any blocked date falls in the range.
  const unavailableIds = new Set<string>();
  if (dated && checkIn && checkOut) {
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
      if (property.blockedDates.includes(isoDate(cursor))) {
        // For demo: mark the "estandar" room as unavailable on blocked dates.
        unavailableIds.add("estandar");
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return (
    <section className="mb-20" aria-labelledby="rooms-title">
      <span className="inline-block text-[12px] font-medium tracking-[0.14em] uppercase text-gold mb-4">
        Habitaciones
      </span>
      <h2
        id="rooms-title"
        className="font-serif font-medium text-ink m-0 mb-5 max-w-[30ch] tracking-[-0.015em]"
        style={{ fontSize: "clamp(26px, 3vw, 32px)", lineHeight: 1.15 }}
      >
        {dated ? "Elige tu lugar para estos días." : "Tres formas de quedarte."}
      </h2>

      <div className="flex flex-col gap-5">
        {property.rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            nights={nights}
            unavailable={unavailableIds.has(room.id)}
            dated={dated}
          />
        ))}
      </div>
    </section>
  );
}

function RoomCard({
  room,
  nights,
  unavailable,
  dated,
}: {
  room: RoomType;
  nights: number;
  unavailable: boolean;
  dated: boolean;
}) {
  const total = nights > 0 ? room.basePriceCOP * nights : 0;

  return (
    <article
      className={[
        "grid gap-5 sm:gap-8 p-4 sm:p-6 bg-paper border border-rule transition-[transform,box-shadow,border-color] duration-300 ease-organic",
        unavailable ? "opacity-60" : "hover:-translate-y-0.5 hover:border-sage-soft hover:shadow-[var(--shadow-soft)]",
        "grid-cols-1 sm:grid-cols-[minmax(0,38%)_1fr]",
      ].join(" ")}
      style={{ borderRadius: 20 }}
    >
      <div className="aspect-[3/2] sm:aspect-[3/2] overflow-hidden bg-linen" style={{ borderRadius: 16 }}>
        <Image
          src={room.photo.src}
          alt={room.photo.alt}
          width={900}
          height={600}
          sizes="(max-width: 640px) 100vw, 38vw"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <h3 className="font-serif italic font-medium text-ink m-0 mb-2 mt-1 tracking-[-0.01em]" style={{ fontSize: 24, lineHeight: 1.15 }}>
          {room.name}
        </h3>

        <p className="text-[13px] text-ink-muted inline-flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Star className="w-3 h-3 text-gold" />
            Para {room.capacity} personas
          </span>
          <span aria-hidden className="text-rule-strong">·</span>
          <span>{room.beds}</span>
          <span aria-hidden className="text-rule-strong">·</span>
          <span>
            <span className="oldstyle">{room.area}</span> m²
          </span>
        </p>

        <p className="text-[15px] leading-[1.55] text-ink-soft m-0 mb-4 max-w-[52ch]">
          {room.description}
        </p>

        <div className="inline-flex flex-wrap gap-1.5 mb-5">
          {room.amenities.map((a) => (
            <span
              key={a}
              className="bg-linen text-ink border border-rule rounded-full px-2.5 py-1 text-[12px] font-medium"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-rule flex flex-wrap justify-between items-end gap-4">
          {unavailable ? (
            <span className="bg-linen text-ink-soft border border-rule rounded-full px-3.5 py-2 text-[12px] font-medium">
              No disponible para estas fechas. Prueba otras.
            </span>
          ) : (
            <span className="text-[12px] text-ink-muted">
              <span className="oldstyle">{room.units}</span> unidades disponibles
            </span>
          )}
          <div className="flex items-end gap-3.5 flex-wrap justify-end">
            <div className="text-right">
              <div className="font-serif font-medium text-ink leading-[1.1] oldstyle tracking-[-0.01em]" style={{ fontSize: 26 }}>
                {dated && total > 0 ? (
                  <>
                    {formatCOP(total)}{" "}
                    <span className="text-[13px] font-sans font-normal text-ink-muted oldstyle">total</span>
                  </>
                ) : (
                  formatCOP(room.basePriceCOP)
                )}
              </div>
              <div className="text-[12px] text-ink-muted mt-0.5">
                {dated && nights > 0
                  ? `${nights} noches × ${formatCOP(room.basePriceCOP)}`
                  : "COP · desde / noche"}
              </div>
            </div>
            {!unavailable && (
              <a
                href={`/p/${room.id}/reserve`}
                className="inline-flex items-center justify-center h-11 px-6 rounded-[14px] text-sm font-medium text-cream bg-terracotta hover:bg-clay active:scale-[0.98] transition-[background-color,transform] duration-200 w-full sm:w-auto whitespace-nowrap"
              >
                Reservar esta habitación
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
