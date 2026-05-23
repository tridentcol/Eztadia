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

  const firstName = profile.full_name?.split(" ")[0] ?? "tu primera propiedad";

  return (
    <>
      <OnboardingTopbar />
      <OnboardingWizard ownerFirstName={firstName} />
    </>
  );
}
