"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  amenitiesSchema,
  type AmenitiesValues,
  AMENITY_GROUPS,
} from "@/lib/property-settings";
import { SectionHeader, ToggleChip } from "../primitives";
import { SaveBar } from "../SaveBar";
import { useSettingsSave } from "../useSettingsSave";
import { IconCheckRing } from "../icons";

export function AmenitiesTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: AmenitiesValues;
}) {
  const form = useForm<AmenitiesValues>({
    resolver: zodResolver(amenitiesSchema),
    defaultValues: initial,
  });
  const { watch, setValue } = form;
  const selected = new Set(watch("selected"));
  const { save, saving, error } = useSettingsSave(propertyId);

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setValue("selected", Array.from(next), { shouldDirty: true });
  }

  async function onSave(v: AmenitiesValues) {
    await save({ amenities: v.selected });
  }

  return (
    <>
      <SectionHeader
        eyebrow="Amenities"
        title="Qué incluye"
        subtitle="Selecciona las amenities disponibles en toda la propiedad. Para amenities específicas de un tipo de habitación, edita en Habitaciones."
      />

      {AMENITY_GROUPS.map((group) => (
        <section key={group.key} className="mb-8">
          <header className="flex items-baseline gap-3 mb-3.5">
            <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark">
              {group.label}
            </span>
            <span aria-hidden className="flex-1 h-px bg-rule" />
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.items.map((it) => {
              const active = selected.has(it.key);
              return (
                <ToggleChip
                  key={it.key}
                  active={active}
                  onClick={() => toggle(it.key)}
                  icon={
                    active ? (
                      <IconCheckRing className="w-3.5 h-3.5" />
                    ) : (
                      <DotIcon />
                    )
                  }
                  label={it.label}
                />
              );
            })}
          </div>
        </section>
      ))}

      {error && (
        <p role="alert" className="text-[13px] text-danger mt-4 mb-0">{error}</p>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

function DotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
      className="w-3.5 h-3.5"
    >
      <circle cx={12} cy={12} r={5} />
    </svg>
  );
}
