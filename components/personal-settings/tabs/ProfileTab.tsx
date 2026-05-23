"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileValues,
  type OwnerProfile,
} from "@/lib/personal-settings";
import { FieldShell, Input, Textarea, Divider } from "@/components/property-settings/primitives";
import { SaveBar } from "@/components/property-settings/SaveBar";
import { FlagCO, IconChevronDown, IconCopy, IconHelpCircle } from "../icons";

export function ProfileTab({ profile }: { profile: OwnerProfile }) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phonePrefix: "+57",
      phone: profile.phone,
      bio: profile.bio,
    },
  });
  const { register, formState } = form;
  const { errors } = formState;
  const [copied, setCopied] = useState(false);

  async function onSave(_v: ProfileValues) {
    await new Promise((r) => setTimeout(r, 250));
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
          Tu perfil
        </h1>
        <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
          Estos datos solo los ves tú y tu equipo. No son públicos.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-10">
        {/* LEFT: profile card */}
        <aside className="bg-paper border border-rule rounded-[20px] p-8 text-center self-start">
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-[144px] h-[144px] rounded-full bg-sage-tint text-sage font-serif font-medium text-[56px] tracking-[-0.02em] mb-5"
          >
            {profile.initials}
          </span>
          <div className="flex flex-col items-center gap-2 mb-6">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint transition-colors"
            >
              Cambiar foto
            </button>
            <button
              type="button"
              className="text-[13px] font-medium text-clay underline underline-offset-[3px] decoration-1 decoration-[rgba(168,72,60,0.4)] hover:decoration-danger transition-colors h-8"
            >
              Eliminar foto
            </button>
          </div>
          <p className="font-serif italic font-medium text-[22px] text-ink m-0 mb-1 tracking-[-0.015em]">
            {profile.fullName}
          </p>
          <p className="text-[13px] text-ink-muted m-0 mb-3.5">{profile.email}</p>
          <span className="inline-flex px-2.5 py-[3px] rounded-full bg-[rgba(184,146,62,0.14)] text-gold-dark text-[10.5px] font-medium tracking-[0.08em] uppercase border border-[rgba(184,146,62,0.22)]">
            {profile.role === "owner" ? "Owner" : profile.role === "manager" ? "Manager" : "Reception"}
          </span>
        </aside>

        {/* RIGHT: form */}
        <div className="max-w-[540px] min-w-0">
          <FieldShell label="Nombre completo" error={errors.fullName?.message}>
            <Input {...register("fullName")} autoComplete="name" />
          </FieldShell>

          <FieldShell
            label="Email"
            helper={
              <>
                Para cambiar tu email{" "}
                <a
                  className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
                  href="https://wa.me/573112223344"
                >
                  contacta a soporte
                </a>
                .
              </>
            }
          >
            <div className="relative">
              <Input value={profile.email} readOnly className="bg-linen text-ink-soft cursor-default" />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted cursor-help"
                title="Para cambiar tu email contacta a soporte"
              >
                <IconHelpCircle className="w-4 h-4" />
              </span>
            </div>
          </FieldShell>

          <FieldShell label="Teléfono" error={errors.phone?.message}>
            <div
              className={[
                "flex h-11 rounded-[10px] overflow-hidden bg-paper border transition-shadow",
                "focus-within:border-sage focus-within:shadow-[0_0_0_3px_var(--color-sage-tint)]",
                errors.phone ? "border-danger" : "border-rule-strong",
              ].join(" ")}
            >
              <button
                type="button"
                tabIndex={-1}
                className="inline-flex items-center gap-2 px-3.5 border-r border-rule bg-cream text-[14px] font-medium text-ink"
              >
                <FlagCO className="rounded-sm border border-rule" />
                +57
                <IconChevronDown className="w-2.5 h-2.5 text-ink-muted" />
              </button>
              <input
                {...register("phone")}
                type="tel"
                autoComplete="tel-national"
                className="flex-1 border-0 outline-0 bg-transparent px-3.5 text-[15px] text-ink placeholder:text-ink-muted"
              />
            </div>
          </FieldShell>

          <Divider />

          <FieldShell
            label="Bio corta — opcional"
            error={errors.bio?.message}
            helper="Visible en facturas y emails que envías a huéspedes."
          >
            <Textarea
              {...register("bio")}
              rows={3}
              placeholder="Cuéntanos sobre ti en una o dos frases."
            />
          </FieldShell>

          <Divider />

          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
            Cuenta
          </span>

          <FieldShell label="ID de cuenta">
            <div className="flex gap-2">
              <Input value={profile.accountId} readOnly className="flex-1 bg-linen text-ink-soft cursor-default font-mono text-[13px] tracking-[-0.01em]" />
              <button
                type="button"
                onClick={copyId}
                className="inline-flex items-center gap-1.5 h-11 px-[14px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors shrink-0"
              >
                <IconCopy className="w-[13px] h-[13px]" />
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </FieldShell>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldShell label="Cuenta creada" className="mb-0">
              <p
                className="font-serif font-medium text-[15px] text-ink m-0"
                style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
              >
                {profile.createdAtLabel}
              </p>
            </FieldShell>
            <FieldShell label="Última conexión" className="mb-0">
              <p
                className="font-serif font-medium text-[15px] text-ink m-0"
                style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
              >
                {profile.lastLoginLabel}
              </p>
            </FieldShell>
          </div>
        </div>
      </div>

      <SaveBar form={form} onSave={onSave} />
    </>
  );
}
