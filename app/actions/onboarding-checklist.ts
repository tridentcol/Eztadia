"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

/**
 * Cookies que gobiernan la visibilidad del OnboardingChecklist y de la
 * celebracion 5/5. Ambas son por sesion del browser (sin maxAge ⇒ se borran
 * al cerrar el browser) excepto el dismiss explicito (1 año, hasta cleanup).
 *
 * - DISMISSED: el owner clickeo "Esconder por ahora". Se ignora si vuelve a
 *   loguearse en otro device. Volvera a aparecer si re-hace login en el
 *   browser y la cookie expira. NO persiste cross-device — esa decision
 *   espera a un campo en profiles si el feedback dice que hace falta.
 * - CELEBRATED: la celebracion ya se mostro. Evita re-mostrarla en cada
 *   page load tras llegar a 5/5.
 * - PROGRESS: bitmask de items completados al momento del ultimo render.
 *   Permite computar diff y emitir audit_log "onboarding.item_completed"
 *   solo en la transicion pending→done.
 */
// Internas — Next prohibe export non-async desde archivos "use server".
const ONBOARDING_DISMISSED_COOKIE = "eztadia.onboarding_dismissed";
const ONBOARDING_CELEBRATED_COOKIE = "eztadia.onboarding_celebrated";
const ONBOARDING_PROGRESS_COOKIE = "eztadia.onboarding_progress";

export async function dismissOnboardingChecklistAction() {
  return run(z.object({}), {}, async () => {
    await requireProfile();
    const cookieStore = await cookies();
    cookieStore.set(ONBOARDING_DISMISSED_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    revalidatePath("/dashboard");
    return { dismissed: true };
  });
}

export async function markChecklistCelebratedAction() {
  return run(z.object({}), {}, async () => {
    await requireProfile();
    const cookieStore = await cookies();
    cookieStore.set(ONBOARDING_CELEBRATED_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return { celebrated: true };
  });
}

const itemKeys = ["roomType", "photos", "pricing", "payments", "publish"] as const;
type ItemKey = (typeof itemKeys)[number];

/**
 * Decode/encode bitmask de 5 bits (uno por item, en el orden de itemKeys).
 * Util para serializar el progreso del checklist en una cookie pequena.
 */
function maskFromKeys(done: ReadonlySet<ItemKey>): number {
  return itemKeys.reduce((acc, k, i) => (done.has(k) ? acc | (1 << i) : acc), 0);
}
function keysFromMask(mask: number): Set<ItemKey> {
  const out = new Set<ItemKey>();
  itemKeys.forEach((k, i) => {
    if (mask & (1 << i)) out.add(k);
  });
  return out;
}

/**
 * Computa el diff entre el bitmask guardado en cookie y el nuevo estado,
 * emite audit_log por cada item recien-completado y actualiza la cookie.
 *
 * Llamado desde el server component de OnboardingChecklist en cada render —
 * es idempotente: si nadie completo nada, no escribe ni cookie ni audit.
 */
export async function trackChecklistProgress(
  propertyId: string,
  doneKeys: ReadonlySet<string>,
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(ONBOARDING_PROGRESS_COOKIE)?.value;
    const prevMask = raw ? Number.parseInt(raw, 10) || 0 : 0;
    const prev = keysFromMask(prevMask);

    const valid = new Set<ItemKey>(
      itemKeys.filter((k) => doneKeys.has(k)),
    );
    const newMask = maskFromKeys(valid);

    if (newMask === prevMask) return; // nada cambio

    const justCompleted = [...valid].filter((k) => !prev.has(k));
    for (const item of justCompleted) {
      // Best-effort: si audit falla no rompemos el render.
      await logAudit({
        action: "onboarding.item_completed",
        resourceType: "property",
        resourceId: propertyId,
        propertyId,
        diff: { item },
      }).catch(() => undefined);
    }

    cookieStore.set(ONBOARDING_PROGRESS_COOKIE, String(newMask), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch {
    // Best-effort: no rompemos el render por un fallo del tracker.
  }
}

export async function isChecklistDismissed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ONBOARDING_DISMISSED_COOKIE)?.value === "1";
}

export async function wasChecklistCelebrated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ONBOARDING_CELEBRATED_COOKIE)?.value === "1";
}
