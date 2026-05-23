import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerSnapshot } from "@/lib/dashboard";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { getProperty } from "@/lib/db/queries/property";
import { Greeting } from "@/components/dashboard/Greeting";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { WeekPulse } from "@/components/dashboard/WeekPulse";
import { UpcomingCheckIns } from "@/components/dashboard/UpcomingCheckIns";

export const metadata: Metadata = {
  title: "Resumen — Eztadia",
};

export default async function DashboardHome() {
  // Auth guard: middleware ya redirige a /login si no hay sesion. Aqui
  // verificamos que el user tenga propiedad — sino, onboarding.
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  // Datos reales para Greeting (resto sigue en demo hasta tener bookings)
  const property = await getProperty(propertyId);

  // TODO(B6 incremental): wire AttentionList/WeekPulse/UpcomingCheckIns a
  // queries reales cuando exista data (bookings, payments). Por ahora demo.
  const demoSnapshot = getOwnerSnapshot();
  const snapshot = {
    ...demoSnapshot,
    owner: {
      ...demoSnapshot.owner,
      firstName: profile.full_name?.split(" ")[0] ?? "tu",
      fullName: profile.full_name ?? "",
      email: profile.email,
      initials: (profile.full_name ?? profile.email)
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    },
    property: {
      ...demoSnapshot.property,
      slug: property.slug,
      name: property.name,
      city: property.city ?? "",
    },
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
