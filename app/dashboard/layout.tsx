import { redirect } from "next/navigation";
import { getOwnerSnapshot } from "@/lib/dashboard";
import {
  getCurrentProfile,
  getActivePropertyId,
  listAccessibleProperties,
} from "@/lib/auth/session";
import { getProperty } from "@/lib/db/queries/property";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [activeId, properties] = await Promise.all([
    getActivePropertyId(),
    listAccessibleProperties(),
  ]);

  // Demo snapshot sigue proveyendo owner/attention/pulse/upcoming/unreadMessages
  // (esos viven en lib/dashboard.ts y aun no estan wired a backend).
  // Sobrescribimos snapshot.property con la activa real, y pasamos availableProperties
  // separado para el switcher.
  const snapshot = getOwnerSnapshot();

  if (activeId) {
    try {
      const p = await getProperty(activeId);
      snapshot.property = {
        slug: p.slug,
        name: p.name,
        city: p.city ?? "",
        photo: snapshot.property.photo, // gallery aun no migrado; demo sigue
      };
    } catch {
      // Si por alguna razon no se puede leer, deja el demo y sigue.
    }
  }

  return (
    <DashboardShell
      snapshot={snapshot}
      availableProperties={properties}
      activePropertyId={activeId}
    >
      {children}
    </DashboardShell>
  );
}
