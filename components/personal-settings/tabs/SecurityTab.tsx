"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordSchema,
  type PasswordValues,
  type OwnerProfile,
} from "@/lib/personal-settings";
import { FieldShell, Divider } from "@/components/property-settings/primitives";
import { PasswordField } from "@/components/auth/fields";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { TwoFAModal } from "../TwoFAModal";
import { IconShieldWarning, IconLockOpen, IconShield } from "../icons";

export function SecurityTab({ profile }: { profile: OwnerProfile }) {
  const [enabled2FA, setEnabled2FA] = useState(profile.twoFactorEnabled);
  const [modalOpen, setModalOpen] = useState(false);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const { register, watch, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;
  const password = watch("next") ?? "";

  async function onChangePassword(_v: PasswordValues) {
    await new Promise((r) => setTimeout(r, 250));
    reset({ current: "", next: "", confirm: "" });
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
          Mantén tu cuenta segura
        </h1>
        <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
          Tu cuenta tiene acceso a datos de tus huéspedes. Protegerla protege a tu negocio.
        </p>
      </header>

      {!enabled2FA && (
        <div
          className="flex items-center gap-4 rounded-[14px] px-6 py-5 mb-8"
          style={{
            background: "var(--color-gold-tint, rgba(184,146,62,0.14))",
            borderLeft: "3px solid var(--color-gold)",
          }}
        >
          <IconShieldWarning className="w-[26px] h-[26px] text-gold-dark shrink-0" />
          <div className="flex-1">
            <p className="font-serif italic font-medium text-[17px] text-ink m-0 mb-0.5 tracking-[-0.01em]">
              Activa la autenticación en dos pasos
            </p>
            <p className="text-[13px] text-ink-soft m-0">
              Una capa extra de seguridad. Toma <span className="oldstyle">2</span> minutos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors shrink-0"
          >
            Activar 2FA →
          </button>
        </div>
      )}

      {/* CONTRASEÑA */}
      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
        Contraseña
      </span>
      <form onSubmit={handleSubmit(onChangePassword)} noValidate className="max-w-[460px]">
        <FieldShell label="Contraseña actual" error={errors.current?.message}>
          <PasswordField {...register("current")} autoComplete="current-password" />
        </FieldShell>
        <FieldShell
          label="Nueva contraseña"
          error={errors.next?.message}
          helper={<PasswordStrength password={password} />}
        >
          <PasswordField {...register("next")} autoComplete="new-password" />
        </FieldShell>
        <FieldShell label="Confirmar nueva contraseña" error={errors.confirm?.message}>
          <PasswordField {...register("confirm")} autoComplete="new-password" />
        </FieldShell>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>

      <Divider />

      {/* 2FA */}
      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
        Autenticación en 2 pasos
      </span>

      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="inline-flex items-center gap-2.5 text-sm font-medium text-ink">
          {enabled2FA ? (
            <IconShield className="w-4 h-4 text-sage" />
          ) : (
            <IconLockOpen className="w-4 h-4 text-gold-dark" />
          )}
          {enabled2FA ? "2FA activado con app TOTP" : "Sin 2FA activado"}
        </span>
        {enabled2FA ? (
          <div className="flex gap-2.5">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 px-[18px] rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint transition-colors"
            >
              Generar nuevos códigos de respaldo
            </button>
            <button
              type="button"
              onClick={() => setEnabled2FA(false)}
              className="inline-flex items-center justify-center h-10 px-[18px] rounded-xl bg-transparent text-danger border border-[rgba(168,72,60,0.25)] text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
            >
              Desactivar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center h-10 px-[18px] rounded-xl bg-terracotta text-cream text-sm font-medium hover:bg-clay transition-colors"
          >
            Activar 2FA
          </button>
        )}
      </div>
      <p className="text-[12.5px] text-ink-soft m-0 mb-4 leading-[1.5]">
        {enabled2FA
          ? "Tu cuenta requiere un código adicional cada vez que inicias sesión."
          : "Recomendado activar para cuentas con propiedades activas. Toma 2 minutos."}
      </p>

      {enabled2FA && (
        <>
          <Divider />
          <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
            Códigos de respaldo
          </span>
          <p className="text-sm text-ink m-0 mb-1">
            <span className="oldstyle">8</span> códigos disponibles ·{" "}
            <span className="oldstyle">2</span> usados
          </p>
          <p className="text-[12.5px] text-ink-soft m-0 mb-3.5 leading-[1.5]">
            Úsalos si pierdes acceso a tu app. Cada código funciona una sola vez.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
          >
            Ver códigos
          </button>
        </>
      )}

      <TwoFAModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={() => setEnabled2FA(true)}
      />
    </>
  );
}
