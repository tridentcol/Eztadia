"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fiscalSchema, type FiscalValues } from "@/lib/property-settings";
import { FieldShell, Input, Textarea, Select, SectionHeader } from "../primitives";
import { SaveBar } from "../SaveBar";

export function FiscalTab({ initial }: { initial: FiscalValues }) {
  const form = useForm<FiscalValues>({
    resolver: zodResolver(fiscalSchema),
    defaultValues: initial,
  });
  const { register, formState } = form;
  const { errors } = formState;

  async function onSave(_v: FiscalValues) {
    await new Promise((r) => setTimeout(r, 250));
  }

  return (
    <>
      <SectionHeader
        eyebrow="Domicilio fiscal"
        title="Datos para facturación"
        subtitle="Aparecen en facturas que emites a tus huéspedes y en recibos de Eztadia."
      />

      <FieldShell label="Razón social" error={errors.legalName?.message}>
        <Input {...register("legalName")} placeholder="Casa Marina S.A.S." />
      </FieldShell>

      <FieldShell label="NIT" error={errors.taxId?.message} helper="Incluye dígito de verificación. Ej: 900.123.456-7.">
        <Input {...register("taxId")} placeholder="900.123.456-7" className="font-mono tracking-[-0.01em]" />
      </FieldShell>

      <FieldShell label="Dirección fiscal" error={errors.fiscalAddress?.message}>
        <Textarea {...register("fiscalAddress")} rows={3} placeholder="Calle, número, ciudad, país." />
      </FieldShell>

      <FieldShell label="Régimen tributario" error={errors.regime?.message}>
        <Select {...register("regime")}>
          <option value="comun">Régimen común</option>
          <option value="simplificado">Régimen simplificado</option>
          <option value="otro">Otro</option>
        </Select>
      </FieldShell>

      <SaveBar form={form} onSave={onSave} />
    </>
  );
}
