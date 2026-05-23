import type { Metadata } from "next";
import { getOwnerSnapshot } from "@/lib/dashboard";
import { Greeting } from "@/components/dashboard/Greeting";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { WeekPulse } from "@/components/dashboard/WeekPulse";
import { UpcomingCheckIns } from "@/components/dashboard/UpcomingCheckIns";

export const metadata: Metadata = {
  title: "Resumen · Casa Marina — Eztadia",
};

export default function DashboardHome() {
  const snapshot = getOwnerSnapshot();
  // The demo wakes up on Fri 21 May 2026, 2:30pm so the greeting is deterministic.
  const now = new Date(2026, 4, 21, 14, 30);

  return (
    <main className="max-w-[1200px] mx-auto px-5 lg:px-14 pt-8 lg:pt-12 pb-24">
      <Greeting snapshot={snapshot} now={now} />

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-8 min-w-0">
          <AttentionList items={snapshot.attention} />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <WeekPulse metrics={snapshot.pulse} />
        </div>
      </section>

      <UpcomingCheckIns items={snapshot.upcoming} />
    </main>
  );
}
