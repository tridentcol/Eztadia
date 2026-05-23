"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { policiesSchema, type PoliciesValues } from "@/lib/property-settings";
import {
  FieldShell,
  Input,
  Textarea,
  ToggleSwitch,
  ToggleRow,
  NumberStepper,
  SectionHeader,
  Divider,
} from "../primitives";
import { SaveBar } from "../SaveBar";
import { useSettingsSave } from "../useSettingsSave";
import { IconCheckRing, IconLockRing } from "../icons";

const CANCELLATION_OPTIONS = [
  {
    key: "flexible" as const,
    title: "Flexible",
    desc: "Cancelación gratuita hasta 24 horas antes del check-in.",
    Icon: CircleIcon,
  },
  {
    key: "moderate" as const,
    title: "Moderada",
    desc: "Cancelación gratuita hasta 48 horas antes. Después, se cobra 1 noche.",
    Icon: IconCheckRing,
  },
  {
    key: "strict" as const,
    title: "Estricta",
    desc: "No reembolso en caso de cancelación. Se cobra el total de la estancia.",
    Icon: IconLockRing,
  },
];

export function PoliciesTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: PoliciesValues;
}) {
  const form = useForm<PoliciesValues>({
    resolver: zodResolver(policiesSchema),
    defaultValues: initial,
  });
  const { register, watch, setValue, control, formState } = form;
  const { errors } = formState;
  const values = watch();
  const { save, saving, error } = useSettingsSave(propertyId);

  async function onSave(v: PoliciesValues) {
    await save({
      bookingPolicy: {
        cancellation: v.cancellation,
        pets: {
          allowed: v.pets,
          ...(v.petsFee !== undefined ? { fee_cents: v.petsFee } : {}),
          ...(v.petsRules ? { rules: v.petsRules } : {}),
        },
        children: {
          allowed: v.children,
          ...(v.childrenFreeAge !== undefined
            ? { free_age_max: v.childrenFreeAge }
            : {}),
        },
        smoking: {
          allowed: v.smoking,
          ...(v.smokingAreas ? { areas: v.smokingAreas } : {}),
        },
        events: { allowed: v.events },
      },
    });
  }

  return (
    <>
      <SectionHeader
        eyebrow="Políticas"
        title="Tus reglas"
        subtitle="Lo que esperas de tus huéspedes. Mostrado en la página pública antes de reservar."
      />

      {/* Cancelación */}
      <FieldShell label="Política de cancelación">
        <Controller
          control={control}
          name="cancellation"
          render={({ field }) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CANCELLATION_OPTIONS.map(({ key, title, desc, Icon }) => {
                const active = field.value === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => field.onChange(key)}
                    aria-pressed={active}
                    className={[
                      "relative text-left rounded-2xl transition-[border-color,background-color,padding] duration-200",
                      "min-h-[130px] flex flex-col",
                      active
                        ? "border-2 border-sage bg-[rgba(229,237,229,0.35)] p-[17px]"
                        : "border border-rule bg-paper p-[18px] hover:border-rule-strong",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className={[
                        "absolute top-3.5 right-3.5 w-4 h-4 rounded-full",
                        active
                          ? "border-[1.5px] border-sage bg-[radial-gradient(circle,var(--color-sage)_0_4px,transparent_4px)]"
                          : "border-[1.5px] border-rule-strong bg-paper",
                      ].join(" ")}
                    />
                    <Icon className={`w-5 h-5 mb-2.5 ${active ? "text-sage" : "text-ink-soft"}`} />
                    <h4 className="font-serif italic font-medium text-[16px] text-ink m-0 mb-1.5 tracking-[-0.005em]">
                      {title}
                    </h4>
                    <p className="text-[12.5px] text-ink-soft leading-[1.45] m-0">{desc}</p>
                  </button>
                );
              })}
            </div>
          )}
        />
      </FieldShell>

      <Divider />

      {/* Mascotas */}
      <ToggleRow
        title="Aceptamos mascotas"
        description="Permite a los huéspedes hospedarse con su mascota. Puedes definir cargo adicional y reglas específicas."
        checked={values.pets}
        onChange={(v) => setValue("pets", v, { shouldDirty: true })}
      />
      {values.pets && (
        <div className="bg-linen rounded-[14px] p-5 mb-3.5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
            <FieldShell label="Cargo adicional" error={errors.petsFee?.message} className="mb-0">
              <div className="flex h-11 rounded-[10px] overflow-hidden bg-paper border border-rule-strong">
                <span className="inline-flex items-center px-3 border-r border-rule bg-cream text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
                  COP $
                </span>
                <input
                  inputMode="numeric"
                  defaultValue={values.petsFee ?? 0}
                  onChange={(e) =>
                    setValue("petsFee", Number(e.target.value.replace(/\D/g, "")), {
                      shouldDirty: true,
                    })
                  }
                  className="flex-1 border-0 outline-0 bg-transparent px-3 font-serif font-medium text-[16px] text-ink"
                  style={{
                    fontVariantNumeric: "tabular-nums oldstyle-nums",
                    fontFeatureSettings: '"onum","tnum"',
                  }}
                />
              </div>
            </FieldShell>
            <FieldShell label="Reglas específicas" className="mb-0">
              <Input {...register("petsRules")} placeholder="Hasta 2 mascotas pequeñas o medianas." />
            </FieldShell>
          </div>
        </div>
      )}

      {/* Niños */}
      <ToggleRow
        title="Aceptamos niños"
        description="Permite huéspedes menores de 13 años."
        checked={values.children}
        onChange={(v) => setValue("children", v, { shouldDirty: true })}
      />
      {values.children && (
        <div className="bg-linen rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-1">
                Edad mínima sin cargo
              </p>
              <p className="text-xs text-ink-muted leading-[1.45]">
                Niños menores de esta edad no pagan compartiendo habitación.
              </p>
            </div>
            <NumberStepper
              value={values.childrenFreeAge ?? 0}
              min={0}
              max={17}
              onChange={(v) => setValue("childrenFreeAge", v, { shouldDirty: true })}
              ariaLabel="Edad mínima sin cargo"
            />
          </div>
        </div>
      )}

      {/* Fumar */}
      <ToggleRow
        title="Se permite fumar"
        description="Si está apagado, mostramos un mensaje a los huéspedes antes de reservar."
        checked={values.smoking}
        onChange={(v) => setValue("smoking", v, { shouldDirty: true })}
      />
      {values.smoking && (
        <div className="bg-linen rounded-[14px] p-5 mb-3.5">
          <FieldShell label="Zonas permitidas" className="mb-0">
            <Textarea
              {...register("smokingAreas")}
              rows={3}
              placeholder="Ej: Patio interior, terraza superior."
            />
          </FieldShell>
        </div>
      )}

      {/* Eventos */}
      <ToggleRow
        title="Permitir eventos / fiestas"
        description="Las reservas que indiquen evento requerirán tu aprobación manual."
        checked={values.events}
        onChange={(v) => setValue("events", v, { shouldDirty: true })}
      />

      {error && (
        <p role="alert" className="text-[13px] text-danger mt-4 mb-0">{error}</p>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden className={className}>
      <circle cx={12} cy={12} r={9} />
      <path d="M8 12h8" />
    </svg>
  );
}
