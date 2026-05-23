"use client";

import { useFormState, type UseFormReturn, type FieldValues } from "react-hook-form";

export function SaveBar<T extends FieldValues>({
  form,
  onSave,
  saving,
}: {
  form: UseFormReturn<T>;
  onSave: (values: T) => Promise<void> | void;
  saving?: boolean;
}) {
  // Subscribe to dirty state via useFormState — guaranteed re-renders in nested components.
  const { isDirty, dirtyFields } = useFormState({ control: form.control });
  if (!isDirty) return null;

  const dirtyCount = Object.keys(dirtyFields).length;

  return (
    <div
      role="region"
      aria-label="Acciones de guardado"
      className="sticky bottom-0 -mx-12 -mb-24 mt-8 flex items-center justify-between gap-4 bg-paper border-t border-rule px-8 py-3.5"
      style={{
        boxShadow: "0 -8px 24px -16px rgba(31,27,22,0.06)",
        animation: "save-bar-in 250ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-ink m-0">Cambios sin guardar</p>
        <p className="text-[12px] text-ink-muted m-0 mt-0.5">
          <span className="oldstyle">{dirtyCount}</span>{" "}
          {dirtyCount === 1 ? "campo modificado" : "campos modificados"}
        </p>
      </div>
      <div className="inline-flex gap-2.5">
        <button
          type="button"
          onClick={() => form.reset()}
          disabled={saving}
          className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong disabled:opacity-60 transition-colors"
        >
          Descartar
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={form.handleSubmit(async (v) => {
            await onSave(v);
            form.reset(v);
          })}
          className="h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
      <style>{`
        @keyframes save-bar-in {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="region"][aria-label="Acciones de guardado"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
