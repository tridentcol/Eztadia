"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advancedSchema, type AdvancedValues } from "@/lib/property-settings";
import {
  SectionHeader,
  ToggleRow,
  NumberStepper,
  Divider,
} from "../primitives";
import { SaveBar } from "../SaveBar";
import { useSettingsSave } from "../useSettingsSave";
import { updatePropertyAction } from "@/app/actions/property";
import { useRouter } from "next/navigation";

export function AdvancedTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: AdvancedValues;
}) {
  const form = useForm<AdvancedValues>({
    resolver: zodResolver(advancedSchema),
    defaultValues: initial,
  });
  const { watch, setValue } = form;
  const values = watch();
  const router = useRouter();
  const { save, saving, error } = useSettingsSave(propertyId);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  async function onSave(v: AdvancedValues) {
    await save({
      bookingPolicy: {
        advanced: {
          show_nightly_price: v.showNightlyPrice,
          instant_bookings: v.instantBookings,
          require_id_document: v.requireIdDocument,
          hold_ttl_pse_minutes: v.holdTtlPseMinutes,
          hold_ttl_manual_hours: v.holdTtlManualHours,
        },
      },
    });
  }

  async function handleDeactivate() {
    if (!confirm("¿Desactivar la propiedad? Su página pública dejará de ser accesible. Puedes reactivarla luego.")) {
      return;
    }
    setDeactivating(true);
    setDeactivateError(null);
    try {
      const result = await updatePropertyAction({ id: propertyId, isActive: false });
      if (!result.ok) {
        setDeactivateError(result.error ?? "No pudimos desactivar.");
        return;
      }
      router.refresh();
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Avanzado"
        title="Configuración avanzada"
        subtitle="Comportamiento del producto y zona sensible. Lee con calma antes de cambiar."
      />

      <ToggleRow
        title="Mostrar precios por noche"
        description="Si está apagado, mostramos el total de la estancia en lugar del precio nocturno."
        checked={values.showNightlyPrice}
        onChange={(v) => setValue("showNightlyPrice", v, { shouldDirty: true })}
      />
      <ToggleRow
        title="Aceptar reservas instantáneas"
        description="Si está apagado, cada reserva requerirá tu aprobación antes de confirmarse."
        checked={values.instantBookings}
        onChange={(v) => setValue("instantBookings", v, { shouldDirty: true })}
      />
      <ToggleRow
        title="Requerir documento de identidad al reservar"
        description="Recomendado para hoteles. Algunos países lo exigen por regulación."
        checked={values.requireIdDocument}
        onChange={(v) => setValue("requireIdDocument", v, { shouldDirty: true })}
      />

      <Divider />

      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-1">
        Tiempo de espera de holds
      </span>
      <p className="text-xs text-ink-muted mb-3.5 leading-[1.55]">
        Cuánto tiempo bloqueamos una habitación cuando un huésped inicia su reserva pero no termina de pagar.
      </p>

      <ToggleRow
        title="Pago PSE"
        description="El huésped completa el pago al instante. Tiempo corto."
        right={
          <NumberStepper
            value={values.holdTtlPseMinutes}
            min={5}
            max={60}
            suffix=" min"
            onChange={(v) => setValue("holdTtlPseMinutes", v, { shouldDirty: true })}
            ariaLabel="Minutos hold PSE"
          />
        }
      />
      <ToggleRow
        title="Transferencia manual"
        description="El huésped sube comprobante. Tiempo más largo."
        right={
          <NumberStepper
            value={values.holdTtlManualHours}
            min={1}
            max={72}
            suffix=" h"
            onChange={(v) => setValue("holdTtlManualHours", v, { shouldDirty: true })}
            ariaLabel="Horas hold manual"
          />
        }
      />

      {/* Danger zone */}
      <section
        aria-label="Zona sensible"
        className="mt-14 p-7 rounded-2xl border border-[rgba(199,111,76,0.18)]"
        style={{ background: "var(--color-terracotta-tint, rgba(199,111,76,0.12))" }}
      >
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-clay mb-2">
          Zona sensible
        </span>
        <h3 className="font-serif italic font-medium text-[20px] text-ink m-0 mb-1.5 tracking-[-0.015em]">
          Desactivar o eliminar la propiedad
        </h3>
        <p className="text-[13px] text-ink-soft m-0 mb-[18px] leading-[1.5]">
          Desactivar oculta la página pública sin perder datos — útil si pausas operaciones. Eliminar es irreversible y borra reservas, fotos y configuración.
        </p>
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-danger border border-danger text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors disabled:opacity-60"
          >
            {deactivating ? "Desactivando…" : "Desactivar propiedad"}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-[13px] font-medium text-clay underline underline-offset-[3px] decoration-1 decoration-[rgba(168,72,60,0.4)] hover:decoration-danger transition-colors"
          >
            Eliminar propiedad permanentemente
          </button>
        </div>
        {deactivateError && (
          <p role="alert" className="text-[13px] text-danger mt-3 mb-0">{deactivateError}</p>
        )}
      </section>

      {showDeleteModal && (
        <DeletePropertyModal onCancel={() => setShowDeleteModal(false)} />
      )}

      {error && (
        <p role="alert" className="text-[13px] text-danger mt-4 mb-0">{error}</p>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

function DeletePropertyModal({ onCancel }: { onCancel: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eliminar propiedad"
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <div
        className="relative z-[101] bg-paper border border-rule rounded-[20px] p-7 max-w-[480px] w-full"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-clay mb-2">
          Acción irreversible
        </span>
        <h3 className="font-serif italic font-medium text-[24px] text-ink m-0 mb-3 tracking-[-0.02em]">
          Eliminar permanentemente
        </h3>
        <p className="text-sm text-ink-soft m-0 mb-4 leading-[1.55]">
          Eliminar borra reservas, fotos, mensajes y configuración de forma definitiva — preferimos hacerlo manualmente para evitar accidentes.
        </p>
        <p className="text-sm text-ink-soft m-0 mb-6 leading-[1.55]">
          Mientras tanto, <strong className="text-ink font-medium">Desactivar propiedad</strong> oculta la página pública sin perder datos.
        </p>
        <div className="rounded-xl bg-linen border border-rule p-4 mb-6">
          <p className="text-[12px] font-medium tracking-[0.08em] uppercase text-ink-muted m-0 mb-1">
            Para eliminar definitivamente
          </p>
          <p className="text-sm text-ink m-0 leading-[1.5]">
            Escríbenos por{" "}
            <a
              href="https://wa.me/573112223344"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
            >
              WhatsApp
            </a>{" "}
            y procesamos el borrado tras confirmar identidad.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
