"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema, type IdentityValues } from "@/lib/property-settings";
import { FieldShell, SectionHeader, Textarea, Divider } from "../primitives";
import { SaveBar } from "../SaveBar";
import { IconPlus } from "../icons";

export function IdentityTab({ initial }: { initial: IdentityValues }) {
  const form = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: initial,
  });
  const { register, watch, formState } = form;
  const [lang, setLang] = useState<"es" | "en">("es");

  const desc = watch(lang === "es" ? "descriptionEs" : "descriptionEn") ?? "";
  const charCount = desc.length;

  async function onSave(_v: IdentityValues) {
    await new Promise((r) => setTimeout(r, 250));
  }

  return (
    <>
      <SectionHeader
        eyebrow="Identidad"
        title="Cómo te presentas"
        subtitle="Tu descripción aparece en la página pública. Edita en ambos idiomas si recibes huéspedes internacionales."
      />

      <FieldShell label="Logo" helper="PNG con fondo transparente. Mínimo 400×400. Aparecerá en facturas y emails.">
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-rule-strong text-ink-muted inline-flex items-center justify-center hover:border-sage-soft hover:text-sage transition-colors shrink-0"
          >
            <IconPlus className="w-6 h-6" />
          </button>
          <div>
            <p className="text-sm font-medium text-ink m-0 mb-1">
              <button type="button" className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage">
                Sube tu logo
              </button>
              <span className="text-ink-muted font-normal"> (opcional)</span>
            </p>
            <p className="text-[13px] text-ink-muted m-0 leading-[1.5] max-w-[360px]">
              Si no tienes logo todavía, usamos el nombre de tu propiedad en Fraunces italic. Puedes subirlo después.
            </p>
          </div>
        </div>
      </FieldShell>

      <Divider />

      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
        Descripción
      </span>

      <div className="inline-flex gap-1 bg-linen rounded-full p-[3px] mb-3.5">
        {(["es", "en"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            className={[
              "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
              lang === code
                ? "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-rule)]"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {code === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      <RichTextToolbar />

      {lang === "es" ? (
        <Textarea
          key="es"
          {...register("descriptionEs")}
          rows={10}
          className="min-h-[240px] leading-[1.65] !rounded-[14px] !p-5"
          placeholder="Cuéntale a tus huéspedes qué hace especial a tu lugar…"
        />
      ) : (
        <Textarea
          key="en"
          {...register("descriptionEn")}
          rows={10}
          className="min-h-[240px] leading-[1.65] !rounded-[14px] !p-5"
          placeholder="Tell your guests what makes your place special…"
        />
      )}

      <p className="text-right text-[12px] text-ink-muted mt-1.5">
        <span className="oldstyle">{charCount}</span> caracteres · Recomendado:{" "}
        <span className="oldstyle">800–1.200</span>
      </p>

      <SaveBar form={form} onSave={onSave} />
    </>
  );
}

function RichTextToolbar() {
  const items = [
    { label: "B", style: "font-bold", title: "Negrita" },
    { label: "I", style: "italic font-serif", title: "Cursiva" },
    { label: "U", style: "underline", title: "Subrayado" },
    { label: "—", style: "", title: "Link" },
    { label: "•", style: "", title: "Lista" },
    { label: "❝", style: "font-serif", title: "Quote" },
  ];
  return (
    <div className="inline-flex gap-0.5 bg-paper border border-rule rounded-[10px] p-1 mb-2.5">
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          title={it.title}
          className={`w-[30px] h-[30px] rounded-md inline-flex items-center justify-center text-ink-soft hover:bg-linen hover:text-ink text-[14px] ${it.style}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
