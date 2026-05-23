import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import {
  getReportMetrics,
  getRevenueByMonth,
  getBreakdownByRoomType,
  getBreakdownByPaymentMethod,
  getBreakdownBySource,
  getReportBookingsForExport,
} from "@/lib/db/queries/reports";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { ReportsView, type PeriodPreset } from "@/components/reports/ReportsView";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";

export const metadata: Metadata = {
  title: "Reportes — Eztadia",
};

function resolvePreset(raw: string | string[] | undefined): PeriodPreset {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (
    v === "this-month" ||
    v === "last-month" ||
    v === "last-30" ||
    v === "last-90" ||
    v === "ytd"
  ) {
    return v;
  }
  return "this-month";
}

function resolveRange(preset: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (preset === "this-month") {
    const from = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1));
    const to = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() + 1, 1));
    return { from: iso(from), to: iso(to) };
  }
  if (preset === "last-month") {
    const from = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - 1, 1));
    const to = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1));
    return { from: iso(from), to: iso(to) };
  }
  if (preset === "ytd") {
    const from = new Date(Date.UTC(todayUtc.getUTCFullYear(), 0, 1));
    const to = new Date(todayUtc.getTime() + 86_400_000);
    return { from: iso(from), to: iso(to) };
  }
  const days = preset === "last-30" ? 30 : 90;
  const from = new Date(todayUtc.getTime() - (days - 1) * 86_400_000);
  const to = new Date(todayUtc.getTime() + 86_400_000);
  return { from: iso(from), to: iso(to) };
}

function iso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const sp = await searchParams;
  const preset = resolvePreset(sp.p);
  const { from, to } = resolveRange(preset);

  const [metrics, monthly, byRoomType, byPaymentMethod, bySource, exportBookings] =
    await Promise.all([
      getReportMetrics(propertyId, from, to),
      getRevenueByMonth(propertyId, 12),
      getBreakdownByRoomType(propertyId, from, to),
      getBreakdownByPaymentMethod(propertyId, from, to),
      getBreakdownBySource(propertyId, from, to),
      getReportBookingsForExport(propertyId, from, to),
    ]);

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[1140px] mx-auto px-5 sm:px-12 py-10 sm:py-12"
      >
        <ReportsView
          preset={preset}
          from={from}
          to={to}
          metrics={metrics}
          monthly={monthly}
          byRoomType={byRoomType}
          byPaymentMethod={byPaymentMethod}
          bySource={bySource}
          exportSlot={<ExportCsvButton bookings={exportBookings} from={from} to={to} />}
        />
      </main>
    </>
  );
}
