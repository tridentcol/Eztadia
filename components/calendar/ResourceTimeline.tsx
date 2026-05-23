"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CalendarBooking, CalendarMonth, RoomGroup } from "@/lib/calendar";
import { isPastBooking } from "@/lib/calendar";
import { BookingPopover } from "./BookingPopover";

type SelectedBooking = {
  booking: CalendarBooking;
  anchorRect: DOMRect;
};

export function ResourceTimeline({ month }: { month: CalendarMonth }) {
  const [selected, setSelected] = useState<SelectedBooking | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [todayLineLeft, setTodayLineLeft] = useState<number>(0);

  // Compute today line position
  useLayoutEffect(() => {
    const update = () => {
      if (!gridRef.current) return;
      const cell = gridRef.current.querySelector<HTMLElement>('[data-today-h="1"]');
      if (!cell) return;
      const gridRect = gridRef.current.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      setTodayLineLeft(cellRect.left - gridRect.left + cellRect.width / 2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [month]);

  // Close popover on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="hidden md:block bg-paper border border-rule rounded-2xl overflow-hidden">
        <div
          className="relative overflow-x-auto overflow-y-visible max-h-[calc(100vh-280px)]"
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(e) => {
            // Click on empty area closes popover (booking buttons stopPropagation)
            if ((e.target as HTMLElement).closest("[data-booking]")) return;
            setSelected(null);
          }}
        >
          <div
            ref={gridRef}
            className="grid relative bg-paper"
            style={{
              gridTemplateColumns: `200px repeat(${month.daysInMonth}, minmax(38px, 1fr))`,
              gridAutoRows: "64px",
              minWidth: 1380,
            }}
          >
            {/* Top-left sticky corner */}
            <div
              aria-hidden
              className="sticky left-0 top-0 bg-paper border-r border-rule-strong border-b border-rule"
              style={{ gridRow: 1, gridColumn: 1, zIndex: 6, height: 56 }}
            />

            {/* Day headers */}
            {Array.from({ length: month.daysInMonth }, (_, i) => {
              const day = i + 1;
              const dow = month.dow[i];
              const isSunday = dow === "DOM";
              const isToday = day === month.today;
              return (
                <div
                  key={`h-${day}`}
                  data-today-h={isToday ? "1" : "0"}
                  className={[
                    "sticky top-0 border-b border-rule border-r border-rule flex flex-col items-center justify-center gap-0.5 z-[4]",
                    isToday ? "bg-sage-tint" : "bg-paper",
                  ].join(" ")}
                  style={{ gridRow: 1, gridColumn: day + 1, height: 56 }}
                >
                  <span
                    className={[
                      "font-serif font-medium leading-none oldstyle",
                      isToday ? "text-sage" : isSunday ? "text-terracotta" : "text-ink",
                    ].join(" ")}
                    style={{ fontSize: 22 }}
                  >
                    {day}
                  </span>
                  <span
                    className={[
                      "text-[10px] font-medium tracking-[0.08em] uppercase",
                      isToday ? "text-sage" : isSunday ? "text-clay" : "text-ink-muted",
                    ].join(" ")}
                  >
                    {dow}
                  </span>
                </div>
              );
            })}

            {/* Group/room rows */}
            {(() => {
              const nodes: React.ReactNode[] = [];
              let row = 2;
              month.groups.forEach((group, gi) => {
                // Group label row
                nodes.push(
                  <div
                    key={`g-${group.key}`}
                    className={[
                      "sticky left-0 flex items-center bg-cream border-b border-rule px-4 text-[11px] font-medium tracking-[0.14em] uppercase text-gold z-[3]",
                      gi === 0 ? "border-t border-rule" : "border-t-2 border-t-rule-strong",
                    ].join(" ")}
                    style={{
                      gridRow: row,
                      gridColumn: `1 / -1`,
                      height: 36,
                    }}
                  >
                    {group.label}
                  </div>,
                );
                row++;

                // Each room
                group.rooms.forEach((rm) => {
                  // Sticky label
                  nodes.push(
                    <div
                      key={`r-${rm.number}`}
                      className="sticky left-0 bg-paper border-r border-rule-strong border-b border-rule px-4 py-2.5 flex flex-col justify-center z-[2]"
                      style={{ gridRow: row, gridColumn: 1 }}
                    >
                      <span className="font-serif italic font-medium text-ink leading-none oldstyle tracking-[-0.005em]" style={{ fontSize: 18 }}>
                        {rm.number}
                      </span>
                      <span className="text-[11px] text-ink-muted mt-0.5">{rm.type}</span>
                    </div>,
                  );

                  // 31 day cells
                  for (let d = 1; d <= month.daysInMonth; d++) {
                    const dow = month.dow[d - 1];
                    const isWeekend = dow === "SÁB" || dow === "DOM";
                    const isToday = d === month.today;
                    nodes.push(
                      <div
                        key={`c-${rm.number}-${d}`}
                        className={[
                          "border-r border-rule border-b border-rule",
                          isWeekend ? "bg-[rgba(242,237,226,0.35)]" : "bg-paper",
                          isToday ? "bg-[rgba(229,237,229,0.25)]" : "",
                        ].join(" ")}
                        style={{ gridRow: row, gridColumn: d + 1 }}
                      />
                    );
                  }

                  // Bookings for this room
                  const roomBookings = month.bookings.filter((b) => b.room === rm.number);
                  roomBookings.forEach((b) => {
                    nodes.push(
                      <BookingBlockInGrid
                        key={b.id}
                        booking={b}
                        row={row}
                        past={isPastBooking(b, month.today)}
                        onClick={(rect) => setSelected({ booking: b, anchorRect: rect })}
                      />
                    );
                  });

                  row++;
                });
              });
              return nodes;
            })()}

            {/* Today vertical line */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 pointer-events-none z-[5]"
              style={{
                left: todayLineLeft - 0.75,
                width: 1.5,
                background: "var(--color-gold)",
                opacity: 0.6,
              }}
            />
          </div>
        </div>
      </div>

      {selected && (
        <BookingPopover
          booking={selected.booking}
          anchorRect={selected.anchorRect}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function BookingBlockInGrid({
  booking,
  row,
  past,
  onClick,
}: {
  booking: CalendarBooking;
  row: number;
  past: boolean;
  onClick: (rect: DOMRect) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const stateClasses = {
    confirmed: "bg-sage text-cream",
    pending: "bg-paper text-sage border-2 border-sage",
    hold: "bg-linen text-ink-soft italic border-[1.5px] border-dashed border-ink-muted",
    external: "text-ink uppercase tracking-[0.05em] text-[10px] font-semibold border border-[rgba(199,111,76,0.32)]",
    "manual-block": "bg-[rgba(139,130,117,0.15)] text-ink-muted text-[11px] border border-[rgba(139,130,117,0.25)]",
  }[booking.status];

  const extraStyle: React.CSSProperties = {
    gridRow: row,
    gridColumn: `${booking.start + 1} / ${booking.end + 1}`,
    margin: "8px 4px",
    padding: booking.status === "pending" || booking.status === "hold" ? "4px 8px" : "6px 10px",
    borderRadius: 8,
  };
  if (booking.status === "external") {
    extraStyle.background = `repeating-linear-gradient(45deg, var(--color-paper), var(--color-paper) 4px, rgba(199, 111, 76, 0.18) 4px, rgba(199, 111, 76, 0.18) 6px)`;
  }

  return (
    <button
      ref={ref}
      type="button"
      data-booking="1"
      onClick={(e) => {
        e.stopPropagation();
        if (ref.current) onClick(ref.current.getBoundingClientRect());
      }}
      className={[
        "self-center justify-self-stretch text-[12px] font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis inline-flex items-center gap-1.5 cursor-pointer transition-[transform,box-shadow] duration-200 ease-organic hover:-translate-y-px hover:shadow-[var(--shadow-soft)] hover:z-[2] z-[1] relative",
        stateClasses,
        past ? "opacity-55" : "",
        booking.todayCheckin ? "shadow-[0_0_0_2px_var(--color-gold),0_0_0_4px_rgba(184,146,62,0.18)]" : "",
        booking.urgent ? "animate-[pulseSoft_3s_ease-in-out_infinite]" : "",
      ].join(" ")}
      style={extraStyle}
    >
      {renderBookingContent(booking)}
    </button>
  );
}

function renderBookingContent(b: CalendarBooking) {
  const span = b.end - b.start;
  if (b.status === "confirmed") {
    return (
      <>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="overflow-hidden text-ellipsis">
          {b.surname}
          {span >= 3 && b.guests ? ` · ${b.guests}p` : ""}
        </span>
      </>
    );
  }
  if (b.status === "pending") {
    return (
      <>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx={12} cy={12} r={9} />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className="overflow-hidden text-ellipsis">{b.surname}</span>
      </>
    );
  }
  if (b.status === "hold") return <span className="overflow-hidden text-ellipsis">(hold) {b.surname}</span>;
  if (b.status === "external") return <span className="overflow-hidden text-ellipsis">{b.source}</span>;
  return <span className="overflow-hidden text-ellipsis">Bloqueada · {b.label}</span>;
}
