import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getFirstAccessibleProperty,
} from "@/lib/auth/session";
import { getCalendarData } from "@/lib/db/queries/calendar";
import { buildCalendarMonth } from "@/lib/calendar/adapter";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export const metadata: Metadata = {
  title: "Calendario — Eztadia",
};

function todayInBogota(): { year: number; month: number; iso: string } {
  const now = new Date();
  // Hardcode America/Bogota → UTC-5 (sin DST). Phase D introduce date-fns-tz.
  const local = new Date(now.getTime() - 5 * 3600_000);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    iso: local.toISOString().slice(0, 10),
  };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getFirstAccessibleProperty();
  if (!propertyId) redirect("/onboarding");

  const today = todayInBogota();
  const sp = await searchParams;
  let year = today.year;
  let month = today.month;
  if (sp.month && /^\d{4}-\d{2}$/.test(sp.month)) {
    const [y, m] = sp.month.split("-").map(Number);
    if (y >= 2020 && y <= 2099 && m >= 1 && m <= 12) {
      year = y;
      month = m;
    }
  }

  const data = await getCalendarData({ propertyId, year, month });
  const calendarMonth = buildCalendarMonth({
    year,
    month,
    todayIso: today.iso,
    rooms: data.rooms,
    roomTypes: data.roomTypes,
    bookings: data.bookings,
    externalBlocks: data.externalBlocks,
  });

  return (
    <>
      <PropertyTabs />
      <div className="px-5 lg:px-8 pt-8 pb-24">
        <CalendarPageClient month={calendarMonth} propertyId={propertyId} />
      </div>
    </>
  );
}
