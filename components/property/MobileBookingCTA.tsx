"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";
import { BookingWidget } from "./BookingWidget";
import { formatCOP } from "@/lib/format";

export function MobileBookingCTA() {
  const { property } = useBooking();
  const [open, setOpen] = useState(false);

  const minPrice = Math.min(...property.rooms.map((r) => r.basePriceCOP));

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="lg:hidden fixed left-4 right-4 bottom-4 z-[60]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full h-14 px-5 rounded-2xl bg-terracotta text-cream flex items-center justify-between gap-3 text-[15px] font-medium"
          style={{ boxShadow: "var(--shadow-pop, var(--shadow-soft))" }}
        >
          <span>Reservar</span>
          <span className="font-serif italic font-medium oldstyle" style={{ fontSize: 17 }}>
            desde COP {formatCOP(minPrice)}
          </span>
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-[70] transition-opacity duration-250 ease-organic ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.4)" }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <aside
        aria-label="Reservar"
        aria-hidden={!open}
        className={`lg:hidden fixed left-0 right-0 bottom-0 z-[80] bg-paper overflow-y-auto transition-transform duration-300 ease-organic ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "92vh", borderRadius: "28px 28px 0 0", paddingBottom: 24 }}
      >
        <div className="w-10 h-1 bg-rule-strong rounded-full mx-auto my-3" aria-hidden />
        <BookingWidget embedded />
      </aside>
    </>
  );
}
