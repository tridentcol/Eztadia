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

export function AdvancedTab({ initial }: { initial: AdvancedValues }) {
  const form = useForm<AdvancedValues>({
    resolver: zodResolver(advancedSchema),
    defaultValues: initial,
  });
  const { watch, setValue } = form;
  const values = watch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function onSave(_v: AdvancedValues) {
    await new Promise((r) => setTimeout(r, 250));
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
            className="inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-danger border border-danger text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
          >
            Desactivar propiedad
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-[13px] font-medium text-clay underline underline-offset-[3px] decoration-1 decoration-[rgba(168,72,60,0.4)] hover:decoration-danger transition-colors"
          >
            Eliminar propiedad permanentemente
          </button>
        </div>
      </section>

      {showDeleteModal && (
        <DeletePropertyModal onCancel={() => setShowDeleteModal(false)} />
      )}

      <SaveBar form={form} onSave={onSave} />
    </>
  );
}

function DeletePropertyModal({ onCancel }: { onCancel: () => void }) {
  const [confirm, setConfirm] = useState("");
  const canDelete = confirm === "ELIMINAR";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar eliminación de propiedad"
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
          ¿Eliminar Casa Marina?
        </h3>
        <p className="text-sm text-ink-soft m-0 mb-5 leading-[1.55]">
          Se eliminarán <strong className="text-ink-soft font-medium">12 habitaciones</strong>, todas las reservas, fotos, mensajes y configuración. Esta acción no se puede deshacer.
        </p>
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2">
          Escribe ELIMINAR para confirmar
        </p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.toUpperCase())}
          autoFocus
          className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[15px] text-ink outline-0 font-mono tracking-[0.08em] mb-6 transition-[border-color,box-shadow] focus:border-danger focus:shadow-[0_0_0_3px_rgba(168,72,60,0.18)]"
        />
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canDelete}
            className="h-10 px-[18px] rounded-xl bg-danger text-cream text-sm font-medium hover:bg-[#8E3C32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Eliminar propiedad
          </button>
        </div>
      </div>
    </div>
  );
}
