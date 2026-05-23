"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { generalSchema, type GeneralValues } from "@/lib/property-settings";
import {
  FieldShell,
  Input,
  Select,
  SectionHeader,
  Divider,
} from "../primitives";
import { SaveBar } from "../SaveBar";
import { IconHelpCircle } from "../icons";

export function GeneralTab({
  initial,
  totalRooms,
}: {
  initial: GeneralValues;
  totalRooms: number;
}) {
  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: initial,
  });
  const { register, formState } = form;
  const { errors } = formState;

  async function onSave(_values: GeneralValues) {
    // In production: POST to /api/properties/:id (general partial).
    await new Promise((r) => setTimeout(r, 250));
  }

  return (
    <>
      <SectionHeader
        eyebrow="General"
        title="Información general"
        subtitle="Datos básicos de tu propiedad. Visibles en la página pública."
      />

      <FieldShell label="Nombre" error={errors.name?.message}>
        <Input {...register("name")} />
      </FieldShell>

      <FieldShell
        label="URL pública"
        helper={
          <>
            El slug está bloqueado para preservar links existentes.{" "}
            <a className="text-sage underline underline-offset-[3px] decoration-1" href="https://wa.me/573112223344">
              Escríbenos
            </a>{" "}
            si necesitas cambiarlo.
          </>
        }
      >
        <div className="flex h-11 rounded-[10px] overflow-hidden bg-linen border border-rule">
          <span className="inline-flex items-center px-3.5 border-r border-rule font-mono text-[13px] text-ink-soft tracking-[-0.01em]">
            eztadia.com/p/
          </span>
          <span className="flex-1 inline-flex items-center px-3.5 font-mono text-[13px] text-ink tracking-[-0.01em]">
            casa-marina
          </span>
          <span
            className="inline-flex items-center justify-center w-8 border-l border-rule text-ink-muted"
            title="Para cambiarlo, escríbenos por WhatsApp"
          >
            <IconHelpCircle className="w-3.5 h-3.5" />
          </span>
        </div>
      </FieldShell>

      <FieldShell label="Tipo de propiedad" error={errors.type?.message}>
        <Select {...register("type")}>
          <option value="hotel">Hotel boutique</option>
          <option value="building">Edificio de habitaciones</option>
          <option value="complex">Complejo / Cabañas</option>
        </Select>
      </FieldShell>

      <FieldShell label="Número de habitaciones" helper="Calculado desde la sección Habitaciones.">
        <div className="flex items-center justify-between bg-paper border border-rule rounded-xl px-[18px] py-3.5">
          <span className="font-serif italic font-medium text-[17px] text-ink tracking-[-0.01em]">
            <span className="oldstyle mr-1">{totalRooms}</span>
            habitaciones · 3 tipos
          </span>
          <Link
            href="/dashboard/rooms"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
          >
            Ver / editar habitaciones
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </FieldShell>

      <Divider />

      <FieldShell label="Dirección" error={errors.address?.message}>
        <Input {...register("address")} />
      </FieldShell>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <FieldShell label="Ciudad" error={errors.city?.message} className="mb-0">
          <Input {...register("city")} />
        </FieldShell>
        <FieldShell label="País" error={errors.country?.message} className="mb-0">
          <Select {...register("country")}>
            <option>Colombia</option>
            <option>México</option>
            <option>Perú</option>
          </Select>
        </FieldShell>
      </div>

      <FieldShell
        label="Zona horaria"
        helper="Define cómo se muestran las fechas y horas en la app y la página pública."
      >
        <Select {...register("timezone")}>
          <option value="America/Bogota">America/Bogotá (GMT-5)</option>
          <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
          <option value="America/Lima">America/Lima (GMT-5)</option>
        </Select>
      </FieldShell>

      <SaveBar form={form} onSave={onSave} />
    </>
  );
}
