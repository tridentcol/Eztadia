import type { Metadata } from "next";
import { OnboardingTopbar } from "@/components/onboarding/OnboardingShell";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getOwnerSnapshot } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Configura tu cuenta — Eztadia",
};

export default function OnboardingPage() {
  // In production: read the authenticated owner. Demo: use the snapshot.
  const snapshot = getOwnerSnapshot();

  return (
    <>
      <OnboardingTopbar />
      <OnboardingWizard ownerFirstName={snapshot.owner.firstName} />
    </>
  );
}
