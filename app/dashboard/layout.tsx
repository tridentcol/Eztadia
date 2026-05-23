import { redirect } from "next/navigation";
import type { OwnerSnapshot } from "@/lib/dashboard";
import {
  getCurrentProfile,
  getActivePropertyId,
  listAccessibleProperties,
} from "@/lib/auth/session";
import { getProperty } from "@/lib/db/queries/property";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const PLACEHOLDER_PROPERTY_PHOTO = "/placeholder.svg";

function initialsFrom(name: string | null, email: string): string {
  const src = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

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

  // El layout solo necesita owner + property + unreadMessages. Atención,
  // pulse, upcoming los provee la page que los muestra (dashboard home).
  let propertyShell: OwnerSnapshot["property"] = {
    slug: "",
    name: "Sin propiedad",
    city: "",
    photo: PLACEHOLDER_PROPERTY_PHOTO,
  };
  if (activeId) {
    try {
      const p = await getProperty(activeId);
      propertyShell = {
        slug: p.slug,
        name: p.name,
        city: p.city ?? "",
        photo: p.cover_image_url ?? PLACEHOLDER_PROPERTY_PHOTO,
      };
    } catch {
      // Si no se puede leer, dejamos el shell por default.
    }
  }

  const firstName = profile.full_name?.split(" ")[0] ?? profile.email.split("@")[0] ?? "tú";

  const snapshot: OwnerSnapshot = {
    owner: {
      firstName,
      fullName: profile.full_name ?? "",
      email: profile.email,
      initials: initialsFrom(profile.full_name, profile.email),
    },
    property: propertyShell,
    attention: [],
    pulse: [],
    upcoming: [],
    unreadMessages: 0,
  };

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
