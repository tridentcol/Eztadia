"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyAction } from "@/app/actions/property";
import type { UpdatePropertyInput } from "@/lib/validation/property";

type PatchPayload = Omit<UpdatePropertyInput, "id">;

/**
 * Hook compartido por los tabs de property-settings.
 *
 * Encapsula:
 *  - llamada a `updatePropertyAction` con propertyId inyectado
 *  - `router.refresh()` para refrescar el server-component data tras guardar
 *  - estado `saving` para mostrar feedback en SaveBar
 *  - error message del result tipado de _helpers (run)
 *
 * Uso:
 *   const { save, saving, error } = useSettingsSave(propertyId);
 *   <SaveBar onSave={(values) => save(toPatch(values))} saving={saving} />
 */
export function useSettingsSave(propertyId: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function save(patch: PatchPayload): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      const result = await updatePropertyAction({ id: propertyId, ...patch });
      if (!result.ok) {
        setError(result.error ?? "No pudimos guardar tus cambios.");
        throw new Error(result.error ?? "save-failed");
      }
      // Refresca server component data (lee de DB de nuevo).
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, error, clearError: () => setError(null) };
}
