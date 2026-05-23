"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { fullDowName, type CalendarBooking, type CalendarMonth } from "@/lib/calendar";

export function MobileCalendarList({ month }: { month: CalendarMonth }) {
  const [selected, setSelected] = useState(month.today);
  const pillsRef = useRef<HTMLDivElement | null>(null);

  // Scroll selected pill into view
  useEffect(() => {
    if (!pillsRef.current) return;
    const el = pillsRef.current.querySelector<HTMLElement>(`[data-day="${selected}"]`);
    if (el) el.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selected]);

  const events = month.bookings.filter(
    (b) => selected >= b.start && selected < b.end,
  );
  const checkins = events.filter((b) => b.start === selected).length;
  const checkouts = month.bookings.filter((b) => b.end === selected).length;
  const dowName = fullDowName(month.dow[selected - 1]);

  return (
    <div className="md:hidden">
      <div
        ref={pillsRef}
        className="flex gap-2 overflow-x-auto pb-4 pt-2 -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {Array.from({ length: month.daysInMonth }, (_, i) => {
          const day = i + 1;
          const dow = month.dow[i];
          const isToday = day === month.today;
          const isSelected = day === selected;
          return (
            <button
              key={day}
              type="button"
              data-day={day}
              onClick={() => setSelected(day)}
              className={[
                "shrink-0 flex flex-col items-center gap-0.5 min-w-14 px-3 py-2.5 rounded-2xl border transition-colors",
                isSelected
                  ? "bg-ink text-cream border-ink"
                  : isToday
                  ? "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]"
                  : "bg-paper text-ink border-rule",
              ].join(" ")}
              style={{ scrollSnapAlign: "start" }}
            >
              <span className={`text-[10px] font-medium tracking-[0.08em] uppercase ${
                isSelected ? "text-cream" : isToday ? "text-sage" : "text-ink-muted"
              }`}>
                {dow}
              </span>
              <span className={`font-serif font-medium text-[22px] leading-none oldstyle ${
                isSelected ? "text-cream" : isToday ? "text-sage" : "text-ink"
              }`}>
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <header className="my-2 mb-4">
        <h2
          className="font-serif font-medium leading-tight m-0 text-ink"
          style={{ fontSize: 32 }}
        >
          <em className="italic">{dowName}</em>,{" "}
          <span className="oldstyle">{selected} mayo</span>
        </h2>
        <p className="text-[13px] text-ink-muted m-0 mt-1">
          {events.length} {events.length === 1 ? "evento" : "eventos"} ·{" "}
          {checkins} {checkins === 1 ? "check-in" : "check-ins"} ·{" "}
          {checkouts} {checkouts === 1 ? "check-out" : "check-outs"}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="text-center py-12 px-6 text-ink-muted text-sm">
            Sin eventos este día.
          </div>
        ) : (
          events.map((b) => <MobileEventCard key={b.id} booking={b} selected={selected} />)
        )}
      </div>

      <button
        type="button"
        className="fixed bottom-5 right-4 inline-flex items-center gap-1.5 h-13 h-[52px] px-5 bg-terracotta text-cream rounded-full text-sm font-medium z-30"
        style={{ boxShadow: "var(--shadow-pop)" }}
        aria-label="Crear reserva manual"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-3.5 h-3.5">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Reserva
      </button>
    </div>
  );
}

function MobileEventCard({ booking, selected }: { booking: CalendarBooking; selected: number }) {
  const cls = booking.status;
  const stripCls = {
    confirmed: "bg-sage",
    pending: "bg-paper border-[1.5px] border-sage",
    hold: "bg-linen border-[1.5px] border-dashed border-ink-muted",
    external: "",
    "manual-block": "bg-[rgba(139,130,117,0.3)]",
  }[cls];
  const stripStyle: React.CSSProperties =
    cls === "external"
      ? {
          background:
            "repeating-linear-gradient(45deg, var(--color-paper), var(--color-paper) 2px, rgba(199,111,76,0.4) 2px, rgba(199,111,76,0.4) 4px)",
        }
      : {};

  let metaText: React.ReactNode = "";
  if (booking.status === "confirmed" || booking.status === "pending") {
    const note =
      booking.start === selected ? <strong>Check-in</strong>
      : booking.end === selected ? <strong>Check-out</strong>
      : "En curso";
    metaText = (
      <>
        Hab. {booking.room} · {booking.guests} personas · {note}
      </>
    );
  } else if (booking.status === "external") {
    metaText = (
      <>
        Hab. {booking.room} · <strong className="text-ink font-medium">{booking.source}</strong> ·{" "}
        {booking.start === selected ? "Check-in" : "En curso"}
      </>
    );
  } else if (booking.status === "hold") {
    metaText = `Hab. ${booking.room} · Hold · pendiente de confirmación`;
  } else if (booking.status === "manual-block") {
    metaText = `Hab. ${booking.room} · ${booking.label}`;
  }

  const name =
    booking.name || booking.source || booking.label || booking.surname || "";

  return (
    <a
      href="#"
      className="grid items-center gap-3 bg-paper border border-rule rounded-2xl px-4 py-3.5"
      style={{ gridTemplateColumns: "auto 1fr auto" }}
    >
      <span aria-hidden className={`w-1 h-10 rounded ${stripCls}`} style={stripStyle} />
      <div>
        <p className="font-serif italic font-medium text-ink text-[15px] m-0 mb-0.5">{name}</p>
        <p className="text-xs text-ink-muted m-0">{metaText}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
    </a>
  );
}
