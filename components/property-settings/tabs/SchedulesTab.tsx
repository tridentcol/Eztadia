"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schedulesSchema, type SchedulesValues } from "@/lib/property-settings";
import {
  FieldShell,
  SectionHeader,
  ToggleRow,
  NumberStepper,
  Divider,
} from "../primitives";
import { SaveBar } from "../SaveBar";
import { useSettingsSave } from "../useSettingsSave";

export function SchedulesTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: SchedulesValues;
}) {
  const form = useForm<SchedulesValues>({
    resolver: zodResolver(schedulesSchema),
    defaultValues: initial,
  });
  const { register, watch, setValue, formState } = form;
  const { errors } = formState;
  const values = watch();
  const { save, saving, error } = useSettingsSave(propertyId);

  async function onSave(v: SchedulesValues) {
    await save({
      checkInTime: v.checkIn,
      checkOutTime: v.checkOut,
      minStayNights: v.minStay,
      maxStayNights: v.maxStayUnlimited ? null : (v.maxStay ?? null),
      bookingPolicy: {
        schedules: {
          early_check_in: v.earlyCheckIn,
          late_check_out: v.lateCheckOut,
        },
      },
    });
  }

  return (
    <>
      <SectionHeader
        eyebrow="Horarios"
        title="Tiempos"
        subtitle="Cuándo llegan y se van tus huéspedes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-2">
        <FieldShell label="Check-in" error={errors.checkIn?.message} className="mb-0">
          <div className="flex items-center gap-3">
            <input
              {...register("checkIn")}
              type="time"
              className="w-[120px] h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 font-serif font-medium text-[17px] text-ink text-center tracking-[-0.01em] outline-0 transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              style={{
                fontVariantNumeric: "oldstyle-nums",
                fontFeatureSettings: '"onum"',
              }}
            />
            <span className="text-[13px] text-ink-muted">Hora de entrada estándar</span>
          </div>
        </FieldShell>

        <FieldShell label="Check-out" error={errors.checkOut?.message} className="mb-0">
          <div className="flex items-center gap-3">
            <input
              {...register("checkOut")}
              type="time"
              className="w-[120px] h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 font-serif font-medium text-[17px] text-ink text-center tracking-[-0.01em] outline-0 transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              style={{
                fontVariantNumeric: "oldstyle-nums",
                fontFeatureSettings: '"onum"',
              }}
            />
            <span className="text-[13px] text-ink-muted">Hora de salida estándar</span>
          </div>
        </FieldShell>
      </div>

      <Divider />

      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
        Flexibilidad
      </span>
      <ToggleRow
        title="Permitir early check-in (con disponibilidad)"
        description="El huésped puede solicitar llegar antes y lo evalúas en el momento."
        checked={values.earlyCheckIn}
        onChange={(v) => setValue("earlyCheckIn", v, { shouldDirty: true })}
      />
      <ToggleRow
        title="Permitir late check-out (con disponibilidad)"
        description="El huésped puede solicitar salir más tarde sin cargo extra."
        checked={values.lateCheckOut}
        onChange={(v) => setValue("lateCheckOut", v, { shouldDirty: true })}
      />

      <Divider />

      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
        Estancia
      </span>

      <ToggleRow
        title="Estancia mínima"
        description="Cantidad mínima de noches por reserva."
        right={
          <NumberStepper
            value={values.minStay}
            min={1}
            max={30}
            suffix=" noches"
            onChange={(v) => setValue("minStay", v, { shouldDirty: true })}
            ariaLabel="Noches mínimas"
          />
        }
      />

      <ToggleRow
        title="Estancia máxima sin límite"
        description="Si activas esto, no hay tope de noches por reserva."
        checked={values.maxStayUnlimited}
        onChange={(v) => setValue("maxStayUnlimited", v, { shouldDirty: true })}
      />

      {!values.maxStayUnlimited && (
        <ToggleRow
          title="Estancia máxima"
          description={errors.maxStay?.message ?? "Cantidad máxima de noches por reserva."}
          right={
            <NumberStepper
              value={values.maxStay ?? 30}
              min={1}
              max={365}
              suffix=" noches"
              onChange={(v) => setValue("maxStay", v, { shouldDirty: true })}
              ariaLabel="Noches máximas"
            />
          }
        />
      )}

      {error && (
        <p role="alert" className="text-[13px] text-danger mt-4 mb-0">{error}</p>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}
