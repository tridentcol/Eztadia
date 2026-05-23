"use client";

import { useState } from "react";
import type { CalendarMonth } from "@/lib/calendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { ResourceTimeline } from "./ResourceTimeline";
import { Legend } from "./Legend";
import { MonthSummaryPanel } from "./MonthSummaryPanel";
import { MobileCalendarList } from "./MobileCalendarList";

export function CalendarPageClient({ month }: { month: CalendarMonth }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <CalendarToolbar
        monthLabel={`Mayo ${month.year}`}
        totalRooms={month.totalRooms}
        occupancyPercent={month.occupancyPercent}
        onOpenSummary={() => setPanelOpen(true)}
      />

      <ResourceTimeline month={month} />
      <Legend />

      <MobileCalendarList month={month} />

      <MonthSummaryPanel
        month={month}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </>
  );
}
