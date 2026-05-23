"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { OnboardingBody } from "./OnboardingShell";
import { Step1OrgForm, Step1Tips } from "./Step1Org";
import { Step2PropertyForm, Step2Tips } from "./Step2Property";
import { Step3RoomsForm, Step3Tips } from "./Step3Rooms";
import { WelcomeFinal } from "./WelcomeFinal";

export function OnboardingWizard({ ownerFirstName }: { ownerFirstName?: string }) {
  const step = useOnboardingStore((s) => s.step);
  const back = useOnboardingStore((s) => s.back);
  const hydrated = useOnboardingStore((s) => s._hasHydrated);

  if (!hydrated) {
    return <Skeleton />;
  }

  if (step === "done") {
    return <WelcomeFinal ownerFirstName={ownerFirstName} />;
  }

  if (step === 1) {
    return <OnboardingBody form={<Step1OrgForm />} tips={<Step1Tips />} />;
  }
  if (step === 2) {
    return (
      <OnboardingBody form={<Step2PropertyForm onBack={back} />} tips={<Step2Tips />} />
    );
  }
  return (
    <OnboardingBody form={<Step3RoomsForm onBack={back} />} tips={<Step3Tips />} />
  );
}

function Skeleton() {
  return (
    <div className="max-w-[1140px] mx-auto px-12 py-14 grid gap-20 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
      <div className="space-y-5">
        <div className="h-2 w-48 bg-linen rounded" aria-hidden />
        <div className="h-10 w-3/4 bg-linen rounded" aria-hidden />
        <div className="h-5 w-2/3 bg-linen rounded" aria-hidden />
        <div className="h-12 bg-linen rounded mt-6" aria-hidden />
        <div className="h-12 bg-linen rounded" aria-hidden />
        <div className="h-12 bg-linen rounded" aria-hidden />
      </div>
      <div>
        <div className="h-32 bg-linen rounded-[20px]" aria-hidden />
      </div>
    </div>
  );
}
