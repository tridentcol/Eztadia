import type { ChecklistStatus } from "@/lib/db/queries/onboarding-checklist";
import {
  isChecklistDismissed,
  wasChecklistCelebrated,
  trackChecklistProgress,
} from "@/app/actions/onboarding-checklist";
import { OnboardingChecklistClient } from "./OnboardingChecklistClient";
import { OnboardingCelebration } from "./OnboardingCelebration";

/**
 * Server wrapper del onboarding checklist. Hace los gates:
 *  - track progress (audit log por item recien-completado)
 *  - hidden si user clickeo "Esconder por ahora"
 *  - celebracion una sola vez al llegar a 5/5
 *  - checklist normal mientras hay items pendientes
 *
 * Toda la interactividad vive en OnboardingChecklistClient / OnboardingCelebration.
 */
export async function OnboardingChecklist({
  status,
  propertyId,
  propertySlug,
}: {
  status: ChecklistStatus;
  propertyId: string;
  propertySlug: string;
}) {
  // Best-effort: audit por items completados desde el ultimo render.
  await trackChecklistProgress(
    propertyId,
    new Set(status.items.filter((i) => i.done).map((i) => i.key)),
  );

  const [dismissed, celebrated] = await Promise.all([
    isChecklistDismissed(),
    wasChecklistCelebrated(),
  ]);

  if (status.allDone) {
    if (celebrated) return null;
    return <OnboardingCelebration propertySlug={propertySlug} />;
  }

  if (dismissed) return null;

  return <OnboardingChecklistClient status={status} propertyId={propertyId} />;
}
