import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getFirstAccessibleProperty,
} from "@/lib/auth/session";
import { getProperty } from "@/lib/db/queries/property";
import { listBookings } from "@/lib/db/queries/bookings";
import {
  getBookingAuditLogs,
  getLatestBookingPayment,
  getRoomById,
} from "@/lib/db/queries/booking-detail";
import { buildBookingRow, buildBookingDetail } from "@/lib/bookings/adapter";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient";
import type { BookingDetail } from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Reservas — Eztadia",
};

function monthBoundsBogota(): { start: string; end: string } {
  // Hardcode America/Bogota → UTC-5. Phase D: date-fns-tz.
  const now = new Date();
  const local = new Date(now.getTime() - 5 * 3600_000);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(y, m + 1, 1)).toISOString().slice(0, 10);
  return { start, end };
}

export default async function BookingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getFirstAccessibleProperty();
  if (!propertyId) redirect("/onboarding");

  const property = await getProperty(propertyId);

  const allRows = await listBookings(propertyId, { limit: 200 });
  const rows = allRows.map(buildBookingRow);

  // Detail por booking — cargamos payment + audit en paralelo
  const details: Record<string, BookingDetail> = {};
  const detailWork = allRows.map(async (b) => {
    const [payment, audit, roomInfo] = await Promise.all([
      getLatestBookingPayment(b.id),
      getBookingAuditLogs(b.id),
      b.room_id ? getRoomById(b.room_id) : Promise.resolve(null),
    ]);
    details[b.code] = buildBookingDetail({
      booking: b,
      property,
      rooms: roomInfo,
      payment,
      auditLogs: audit,
    });
  });
  await Promise.all(detailWork);

  // KPIs del mes (filtramos contra check_in en mes actual)
  const { start, end } = monthBoundsBogota();
  const ofMonth = allRows.filter(
    (b) => b.check_in >= start && b.check_in < end,
  );
  const total = ofMonth.length;
  const confirmed = ofMonth.filter((b) =>
    ["confirmed", "checked_in", "checked_out", "completed"].includes(b.status),
  ).length;
  const pending = ofMonth.filter((b) => b.status === "pending_payment").length;

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
