"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  languageSchema,
  type LanguageValues,
} from "@/lib/personal-settings";
import { updateLanguagePrefsAction } from "@/app/actions/profile";
import { FieldShell, Select, Divider } from "@/components/property-settings/primitives";
import { SaveBar } from "@/components/property-settings/SaveBar";
import { FlagCO, FlagUS } from "../icons";

export function LanguageTab({ initial }: { initial: LanguageValues }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const form = useForm<LanguageValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: initial,
  });
  const { control, register } = form;

  async function onSave(v: LanguageValues) {
    setSaving(true);
    setError(null);
    try {
      // Solo persistimos language + dateFormat + numberFormat (timezone es
      // demo por ahora — no hay schema profile.timezone).
      const res = await updateLanguagePrefsAction({
        language: v.language,
        dateFormat: v.dateFormat,
        numberFormat: v.numberFormat,
      });
      if (!res.ok) {
        setError(res.error ?? "No pudimos guardar tus preferencias.");
        throw new Error("save-failed");
      }
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
          Idioma y región
        </h1>
        <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
          Cómo te mostramos fechas, números y mensajes en la plataforma.
        </p>
      </header>

      <div className="max-w-[540px]">
        {/* Idioma */}
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
          Idioma de la plataforma
        </span>
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3" role="radiogroup">
              <LangCard
                active={field.value === "es"}
                onClick={() => field.onChange("es")}
                flag={<FlagCO className="rounded-sm border border-rule" />}
                label="Español"
                sub="Colombia neutral"
              />
              <LangCard
                active={field.value === "en"}
                onClick={() => field.onChange("en")}
                flag={<FlagUS className="rounded-sm border border-rule" />}
                label="English"
                sub="United States"
              />
            </div>
          )}
        />

        <Divider />

        {/* Date format */}
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
          Formato de fecha
        </span>
        <Controller
          control={control}
          name="dateFormat"
          render={({ field }) => (
            <div className="flex flex-col gap-2" role="radiogroup">
              {(
                [
                  { key: "dmy", label: "Día / Mes / Año", example: "21/05/2026" },
                  { key: "mdy", label: "Mes / Día / Año", example: "05/21/2026" },
                  { key: "iso", label: "Año-Mes-Día (ISO)", example: "2026-05-21" },
                ] as const
              ).map((opt) => (
                <FormatOption
                  key={opt.key}
                  active={field.value === opt.key}
                  onClick={() => field.onChange(opt.key)}
                  label={opt.label}
                  example={opt.example}
                />
              ))}
            </div>
          )}
        />

        <Divider />

        {/* Number format */}
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3">
          Formato de número
        </span>
        <Controller
          control={control}
          name="numberFormat"
          render={({ field }) => (
            <div className="flex flex-col gap-2" role="radiogroup">
              <FormatOption
                active={field.value === "comma-decimal"}
                onClick={() => field.onChange("comma-decimal")}
                label="Coma decimal"
                example="1.234.567,89"
              />
              <FormatOption
                active={field.value === "dot-decimal"}
                onClick={() => field.onChange("dot-decimal")}
                label="Punto decimal"
                example="1,234,567.89"
              />
            </div>
          )}
        />

        <Divider />

        <FieldShell
          label="Zona horaria"
          helper="Define cómo se muestran las horas en el calendario y las reservas."
        >
          <Select {...register("timezone")}>
            <option value="America/Bogota">America/Bogotá (GMT-5)</option>
            <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
            <option value="America/Lima">America/Lima (GMT-5)</option>
            <option value="America/Caracas">America/Caracas (GMT-4)</option>
          </Select>
        </FieldShell>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-xs text-danger border border-danger/30 bg-danger/5 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

function LangCard({
  active,
  onClick,
  flag,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  flag: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "flex items-center gap-3 text-left rounded-[14px] transition-[border-color,background-color,padding] duration-200",
        active
          ? "border-2 border-sage bg-[rgba(229,237,229,0.35)] px-[15px] py-[13px]"
          : "border border-rule bg-paper px-4 py-3.5 hover:border-rule-strong",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "w-4 h-4 rounded-full shrink-0",
          active
            ? "border-[1.5px] border-sage bg-[radial-gradient(circle,var(--color-sage)_0_4px,transparent_4px)]"
            : "border-[1.5px] border-rule-strong bg-paper",
        ].join(" ")}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink m-0 mb-0.5 inline-flex items-center gap-2">
          {flag}
          {label}
        </p>
        <p className="text-[11px] text-ink-muted m-0">{sub}</p>
      </div>
    </button>
  );
}

function FormatOption({
  active,
  onClick,
  label,
  example,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  example: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-xl transition-[border-color,background-color,padding] duration-200",
        active
          ? "border-2 border-sage bg-[rgba(229,237,229,0.35)] px-[15px] py-[11px]"
          : "border border-rule bg-paper px-4 py-3 hover:border-rule-strong",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "w-4 h-4 rounded-full shrink-0",
          active
            ? "border-[1.5px] border-sage bg-[radial-gradient(circle,var(--color-sage)_0_4px,transparent_4px)]"
            : "border-[1.5px] border-rule-strong bg-paper",
        ].join(" ")}
      />
      <span className="flex-1 inline-flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        <span
          className="font-serif font-medium text-ink-soft"
          style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
        >
          {example}
        </span>
      </span>
    </button>
  );
}
