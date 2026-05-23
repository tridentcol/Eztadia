import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { OwnerSnapshot } from "@/lib/dashboard";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { getProperty } from "@/lib/db/queries/property";
import {
  getWeekPulseMetrics,
  getAttentionItems,
  getUpcomingCheckInsDashboard,
} from "@/lib/db/queries/dashboard";
import { Greeting } from "@/components/dashboard/Greeting";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { WeekPulse } from "@/components/dashboard/WeekPulse";
import { UpcomingCheckIns } from "@/components/dashboard/UpcomingCheckIns";

export const metadata: Metadata = {
  title: "Resumen — Eztadia",
};

function initialsFrom(name: string | null, email: string): string {
  const src = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const PLACEHOLDER_PROPERTY_PHOTO = "/placeholder.svg";

export default async function DashboardHome() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const [property, pulse, attention, upcoming] = await Promise.all([
    getProperty(propertyId),
    getWeekPulseMetrics(propertyId),
    getAttentionItems(propertyId),
    getUpcomingCheckInsDashboard(propertyId),
  ]);

  const firstName = profile.full_name?.split(" ")[0] ?? profile.email.split("@")[0] ?? "tú";

  const snapshot: OwnerSnapshot = {
    owner: {
      firstName,
      fullName: profile.full_name ?? "",
      email: profile.email,
      initials: initialsFrom(profile.full_name, profile.email),
    },
    property: {
      slug: property.slug,
      name: property.name,
      city: property.city ?? "",
      photo: property.cover_image_url ?? PLACEHOLDER_PROPERTY_PHOTO,
    },
    pulse,
    attention,
    upcoming,
    // Sin flag de unread en whatsapp_messages todavía — schema decision Phase E2.
    unreadMessages: 0,
  };

  const now = new Date();

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
