import type { Metadata } from "next";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { StaffPageClient } from "@/components/staff/StaffPageClient";
import { getStaff } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Staff · Casa Marina — Eztadia",
};

export default function StaffPage() {
  const members = getStaff();

  return (
    <>
      <PropertyTabs />
      <main id="main" className="max-w-[1140px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24">
        <StaffPageClient members={members} />
      </main>
    </>
  );
}
