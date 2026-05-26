import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingTopbar } from "@/components/onboarding/OnboardingShell";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import {
  getCurrentProfile,
  getFirstAccessibleProperty,
} from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Configura tu cuenta — Eztadia",
};

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  // Si ya tiene propiedad, no rehacemos onboarding.
  const existing = await getFirstAccessibleProperty();
  if (existing) redirect("/dashboard");

  // Staff sin asignaciones no puede crear org/property. Mostramos mensaje
  // de espera en lugar del wizard (que requiere ser owner).
  const isStaff =
    profile.role === "staff_manager" ||
    profile.role === "staff_reception" ||
    profile.role === "guest";

  if (isStaff) {
    return (
      <>
        <OnboardingTopbar />
        <main className="max-w-[560px] mx-auto px-6 py-20 text-center">
          <span className="inline-block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-3">
            Tu cuenta
          </span>
          <h1 className="font-serif italic font-medium text-[clamp(28px,4vw,40px)] text-ink m-0 mb-4 tracking-[-0.025em]">
            Esperando invitación.
          </h1>
          <p className="text-[15px] leading-[1.6] text-ink-soft m-0 mb-8 max-w-[44ch] mx-auto">
            Tu cuenta no tiene propiedades asignadas todavía. Pedile al
            administrador de la propiedad que te envíe una invitación al
            email registrado.
          </p>
          <a
            href="/login?signout=1"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-cream border border-rule text-ink-soft text-sm font-medium hover:bg-linen hover:text-ink transition-colors"
          >
            Cerrar sesión
          </a>
        </main>
      </>
    );
  }

  const firstName = profile.full_name?.split(" ")[0] ?? "tu primera propiedad";

  return (
    <>
      <OnboardingTopbar />
      <OnboardingWizard ownerFirstName={firstName} />
    </>
  );
}
