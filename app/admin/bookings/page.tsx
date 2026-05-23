import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";
import {
  listAdminBookings,
  getAdminBookingDetail,
  type AdminBookingDetail,
} from "@/lib/db/queries/admin";
import { BookingsPageClient } from "@/components/admin/bookings/BookingsPageClient";

export const metadata: Metadata = {
  title: "Admin · Reservas — Eztadia",
};

export default async function AdminBookingsPage() {
  let rows: Awaited<ReturnType<typeof listAdminBookings>>;
  try {
    rows = await listAdminBookings();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/login");
    if (err instanceof ForbiddenError) redirect("/forbidden");
    throw err;
  }

  // Precarga primeros 50 details (drawer sin round-trip).
  const detailsArr = await Promise.all(
    rows.slice(0, 50).map(async (r) => {
      try {
        return [r.id, await getAdminBookingDetail(r.id)] as const;
      } catch {
        return [r.id, null] as const;
      }
    }),
  );

  const details: Record<string, AdminBookingDetail> = {};
  for (const [id, d] of detailsArr) {
    if (d) details[id] = d;
  }

  const confirmedCount = rows.filter((r) => r.status === "confirmed").length;
  const pendingCount = rows.filter((r) => r.status === "pending_payment").length;

  return (
    <main
      id="main"
      className="max-w-[1320px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
          Reservas en la plataforma
        </h1>
        <p className="text-sm text-ink-muted m-0">
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {rows.length}
          </span>{" "}
          totales ·{" "}
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {confirmedCount}
          </span>{" "}
          confirmadas ·{" "}
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {pendingCount}
          </span>{" "}
          en pago pendiente
        </p>
      </header>

      <BookingsPageClient rows={rows} details={details} />
    </main>
  );
}
