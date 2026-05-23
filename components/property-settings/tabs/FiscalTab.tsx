"use client";

import type { FiscalValues } from "@/lib/property-settings";
import { FieldShell, Input, Textarea, Select, SectionHeader } from "../primitives";

export function FiscalTab({ initial: _initial }: { initial: FiscalValues }) {
  return (
    <>
      <SectionHeader
        eyebrow="Domicilio fiscal"
        title="Datos para facturación"
        subtitle="Aparecen en facturas que emites a tus huéspedes y en recibos de Eztadia."
      />

      <div
        role="status"
        className="rounded-xl bg-linen border border-rule px-4 py-3 mb-7 text-[13px] text-ink-soft leading-[1.55]"
      >
        <strong className="text-ink font-medium">Próximamente.</strong>{" "}
        Estos campos serán parte del módulo de facturación electrónica que aún
        no está activo. Por ahora son solo referencia visual y no se guardan.
      </div>

      <fieldset disabled className="opacity-60 cursor-not-allowed">
        <FieldShell label="Razón social">
          <Input placeholder="Casa Marina S.A.S." />
        </FieldShell>

        <FieldShell label="NIT" helper="Incluye dígito de verificación. Ej: 900.123.456-7.">
          <Input placeholder="900.123.456-7" className="font-mono tracking-[-0.01em]" />
        </FieldShell>

        <FieldShell label="Dirección fiscal">
          <Textarea rows={3} placeholder="Calle, número, ciudad, país." />
        </FieldShell>

        <FieldShell label="Régimen tributario">
          <Select defaultValue="comun">
            <option value="comun">Régimen común</option>
            <option value="simplificado">Régimen simplificado</option>
            <option value="otro">Otro</option>
          </Select>
        </FieldShell>
      </fieldset>
    </>
  );
}
