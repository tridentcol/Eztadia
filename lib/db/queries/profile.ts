import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import type { OwnerProfile } from "@/lib/personal-settings";

/**
 * Lee el perfil del usuario actual desde la BD y lo mapea al shape
 * `OwnerProfile` que consume PersonalSettings. Reemplaza el demo
 * `getPersonalSettings().profile` que devolvia datos fake hardcoded.
 *
 * Campos no presentes en schema profiles (bio, backupCodes, lastLogin):
 *   - bio: por ahora vacio. Si lo agregamos, requiere migration.
 *   - backupCodes: feature de SecurityTab, no Profile. 0/0 default.
 *   - lastLoginLabel: viene de auth.users.last_sign_in_at (admin client).
 *     Por ahora "—". Lo wireamos cuando agreguemos un getter admin.
 */
export async function getOwnerProfileForSettings(): Promise<OwnerProfile> {
  const profile = await requireProfile();

  return {
    fullName: profile.full_name ?? "",
    email: profile.email,
    initials: initialsFrom(profile.full_name, profile.email),
    phone: profile.phone ?? "",
    bio: "",
    role: mapRole(profile.role),
    accountId: profile.id,
    createdAtLabel: formatLongDate(profile.created_at),
    lastLoginLabel: "—",
    twoFactorEnabled: profile.totp_enabled,
    backupCodesAvailable: 0,
    backupCodesUsed: 0,
  };
}

/**
 * Mapea UserRole (global de la cuenta) al subset que muestra el pill del
 * perfil. super_admin se muestra como owner.
 */
function mapRole(
  r: "super_admin" | "owner" | "staff_manager" | "staff_reception" | "guest",
): "owner" | "manager" | "reception" {
  if (r === "owner" || r === "super_admin") return "owner";
  if (r === "staff_manager") return "manager";
  return "reception";
}

function initialsFrom(name: string | null, email: string): string {
  const src = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}
