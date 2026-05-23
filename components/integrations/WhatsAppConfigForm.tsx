"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FieldShell,
  Input,
  ToggleSwitch,
} from "@/components/property-settings/primitives";
import { SaveBar } from "@/components/property-settings/SaveBar";
import { IconEye, IconEyeSlash } from "@/components/auth/icons";
import {
  saveWhatsAppConfigAction,
  removeWhatsAppConfigAction,
} from "@/app/actions/whatsapp";

const schema = z.object({
  businessAccountId: z.string().min(8, "Business Account ID requerido.").max(64),
  phoneNumberId: z.string().min(8, "Phone Number ID requerido.").max(64),
  accessToken: z.string().max(2048).optional().or(z.literal("")),
  isActive: z.boolean(),
});
type Values = z.infer<typeof schema>;

export type WhatsAppConfigInitial = {
  businessAccountId: string | null;
  phoneNumberId: string | null;
  hasAccessToken: boolean;
  isActive: boolean;
};

export function WhatsAppConfigForm({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: WhatsAppConfigInitial | null;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessAccountId: initial?.businessAccountId ?? "",
      phoneNumberId: initial?.phoneNumberId ?? "",
      accessToken: "",
      isActive: initial?.isActive ?? false,
    },
  });
  const { register, watch, setValue, formState, setError } = form;
  const { errors } = formState;
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const isActive = watch("isActive");

  async function onSave(v: Values) {
    setSaving(true);
    setBanner(null);
    try {
      // Si el user NO había guardado todavía un token y dejó el campo vacío,
      // bloquear: WhatsApp no funciona sin token.
      const noStoredToken = !initial?.hasAccessToken;
      if (noStoredToken && (!v.accessToken || v.accessToken.length === 0)) {
        setError("accessToken", {
          message: "Pega el access token de Meta para guardar.",
        });
        return;
      }
      const res = await saveWhatsAppConfigAction({
        propertyId,
        businessAccountId: v.businessAccountId,
        phoneNumberId: v.phoneNumberId,
        accessToken: v.accessToken || "",
        isActive: v.isActive,
      });
      if (!res.ok) {
        setBanner(res.error);
        return;
      }
      setBanner("Guardado.");
      form.reset({ ...v, accessToken: "" });
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    if (!confirm("¿Eliminar la configuración de WhatsApp? Los mensajes salientes dejarán de enviarse.")) return;
    setRemoving(true);
    setBanner(null);
    try {
      const res = await removeWhatsAppConfigAction({ propertyId });
      if (!res.ok) {
        setBanner(res.error);
        return;
      }
      setBanner("Eliminada.");
      form.reset({
        businessAccountId: "",
        phoneNumberId: "",
        accessToken: "",
        isActive: false,
      });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <section className="mt-9">
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
          Estado
        </span>
        <div className="flex items-center justify-between gap-4 bg-paper border border-rule rounded-[14px] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-ink m-0">
              {isActive ? "Activa" : "Inactiva"}
            </p>
            <p className="text-[12px] text-ink-muted m-0 mt-0.5">
              {isActive
                ? "Se envían notificaciones automáticas a tus huéspedes."
                : "Los mensajes salientes están pausados."}
            </p>
          </div>
          <ToggleSwitch
            checked={isActive}
            onChange={(next) =>
              setValue("isActive", next, { shouldDirty: true })
            }
            ariaLabel="Activar WhatsApp"
          />
        </div>
      </section>

      <section className="mt-9">
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
          Credenciales Meta Cloud API
        </span>

        <FieldShell
          label="Business Account ID"
          error={errors.businessAccountId?.message}
          helper="Lo encuentras en Business Manager → WhatsApp Business Account."
        >
          <Input
            {...register("businessAccountId")}
            className="font-mono text-[14px] tracking-[-0.01em]"
            autoComplete="off"
            placeholder="123456789012345"
          />
        </FieldShell>

        <FieldShell
          label="Phone Number ID"
          error={errors.phoneNumberId?.message}
          helper="ID del número conectado (no el número en sí)."
        >
          <Input
            {...register("phoneNumberId")}
            className="font-mono text-[14px] tracking-[-0.01em]"
            autoComplete="off"
            placeholder="123456789012345"
          />
        </FieldShell>

        <SecretInput
          label="Access Token"
          error={errors.accessToken?.message}
          placeholder={
            initial?.hasAccessToken
              ? "•••• guardado (re-pegar para cambiar)"
              : "EAAxxxxxxxxxxxxxx…"
          }
          {...register("accessToken")}
        />

        {initial && (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="mt-4 inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-transparent text-danger border border-danger/40 text-[13px] font-medium hover:bg-danger/5 disabled:opacity-60 transition-colors"
          >
            {removing ? "Eliminando…" : "Eliminar configuración"}
          </button>
        )}

        {banner && (
          <div
            role="status"
            className="flex gap-2.5 px-4 py-3 rounded-[10px] mt-3 text-sm leading-[1.45] text-ink bg-sage-tint border-l-[3px] border-sage"
          >
            {banner}
          </div>
        )}
      </section>

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

type SecretProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const SecretInput = forwardRef<HTMLInputElement, SecretProps>(function SecretInput(
  { label, error, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <FieldShell label={label} error={error}>
      <div className="relative">
        <input
          ref={ref}
          {...rest}
          type={show ? "text" : "password"}
          autoComplete="off"
          className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] pl-3.5 pr-11 text-[15px] text-ink outline-0 font-mono tracking-[-0.01em] transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ocultar" : "Mostrar"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-lg text-ink-muted hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          {show ? <IconEyeSlash className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
        </button>
      </div>
    </FieldShell>
  );
});
