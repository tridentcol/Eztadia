import type { Metadata } from "next";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient";
import {
  getBookings,
  getBookingDetail,
  totalForMonth,
  type BookingDetail,
} from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Reservas · Casa Marina — Eztadia",
};

export default function BookingsPage() {
  const rows = getBookings();
  const { total, confirmed, pending } = totalForMonth();

  const details = rows.reduce<Record<string, BookingDetail>>((acc, r) => {
    const d = getBookingDetail(r.code);
    if (d) acc[r.code] = d;
    return acc;
  }, {});

  return (
    <>
      <PropertyTabs />

      <main className="px-5 lg:px-8 pt-8 pb-24" id="main">
        <header className="flex items-end justify-between gap-6 flex-wrap mb-7">
          <div>
            <h1
              className="font-serif italic font-medium text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]"
              style={{ fontSize: 32 }}
            >
              Reservas
            </h1>
            <p className="text-sm text-ink-muted m-0">
              <span className="text-ink-soft font-medium oldstyle">{total}</span> este mes ·{" "}
              <span className="text-ink-soft font-medium oldstyle">{confirmed}</span> confirmadas ·{" "}
              <span className="text-ink-soft font-medium oldstyle">{pending}</span> pendientes de pago
            </p>
          </div>
          <div className="inline-flex gap-2.5">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl text-sm font-medium text-sage border border-sage bg-transparent hover:bg-sage-tint transition-colors"
            >
              <svg
                className="w-[15px] h-[15px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 4v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
              Exportar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl text-sm font-medium text-cream bg-terracotta hover:bg-clay transition-colors"
            >
              <svg
                className="w-[15px] h-[15px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Nueva reserva manual
            </button>
          </div>
        </header>

        <BookingsPageClient rows={rows} details={details} />
      </main>
    </>
  );
}
