"use client";

import { useState } from "react";
import type { CalendarMonth } from "@/lib/calendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { ResourceTimeline } from "./ResourceTimeline";
import { Legend } from "./Legend";
import { MonthSummaryPanel } from "./MonthSummaryPanel";
import { MobileCalendarList } from "./MobileCalendarList";
import { useRealtimeBookings } from "./useRealtimeBookings";

const MONTH_LABELS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function CalendarPageClient({
  month,
  propertyId,
}: {
  month: CalendarMonth;
  propertyId?: string | null;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  useRealtimeBookings(propertyId);

  return (
    <>
      <CalendarToolbar
        monthLabel={`${MONTH_LABELS_ES[month.month - 1]} ${month.year}`}
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
