import type { Metadata } from "next";
import { getCalendarMonth } from "@/lib/calendar";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export const metadata: Metadata = {
  title: "Calendario · Casa Marina — Eztadia",
};

export default function CalendarPage() {
  const month = getCalendarMonth();

  return (
    <>
      <PropertyTabs />
      <div className="px-5 lg:px-8 pt-8 pb-24">
        <CalendarPageClient month={month} />
      </div>
    </>
  );
}
