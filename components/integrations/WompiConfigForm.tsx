"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FieldShell,
  Input,
} from "@/components/property-settings/primitives";
import { SaveBar } from "@/components/property-settings/SaveBar";
import { IconEye, IconEyeSlash } from "@/components/auth/icons";
import {
  saveWompiConfigAction,
  removeWompiConfigAction,
} from "@/app/actions/wompi";

const schema = z.object({
  environment: z.enum(["sandbox", "production"]),
  publicKey: z.string().min(8, "Public key requerida."),
  privateKey: z.string().min(8, "Private key requerida."),
  eventsSecret: z.string().min(8, "Events secret requerido."),
});

type Values = z.infer<typeof schema>;

export type WompiConfigInitial = {
  publicKey: string;
  isTestMode: boolean;
  hasPrivateKey: boolean;
  hasEventsSecret: boolean;
};

export function WompiConfigForm({
  propertyId,
  initial,
  webhookUrl,
}: {
  propertyId: string;
  initial: WompiConfigInitial | null;
  webhookUrl: string;
}) {
  // Private key + events secret no se descifran al servidor (only en server-side
  // route handlers). En la UI los mostramos como placeholder "•••• guardado" si
  // ya hay valor; el usuario los re-tipea para cambiar.
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      environment: initial?.isTestMode ? "sandbox" : "production",
      publicKey: initial?.publicKey ?? "",
      privateKey: "",
      eventsSecret: "",
    },
  });
  const { register, control, formState, setError } = form;
  const { errors } = formState;
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  async function onSave(v: Values) {
    setSaving(true);
    setSaveBanner(null);
    try {
      // Si el user dejo private/events vacios y ya hay valores guardados,
      // no podemos enviarlos (Zod requiere min 8). Forzamos a que vuelva
      // a pegarlos cuando guardan.
      if (!v.privateKey || !v.eventsSecret) {
        setError("privateKey", {
          message: !v.privateKey ? "Pega de nuevo la private key para guardar." : undefined,
        });
        setError("eventsSecret", {
          message: !v.eventsSecret ? "Pega de nuevo el events secret para guardar." : undefined,
        });
        return;
      }
      const res = await saveWompiConfigAction({
        propertyId,
        publicKey: v.publicKey,
        privateKey: v.privateKey,
        eventsSecret: v.eventsSecret,
        isTestMode: v.environment === "sandbox",
      });
      if (!res.ok) {
        setSaveBanner(res.error);
        return;
      }
      setSaveBanner("Guardado.");
      // Limpia campos secretos para no dejarlos en memoria del DOM
      form.reset({ ...v, privateKey: "", eventsSecret: "" });
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    if (!confirm("¿Eliminar la configuracion de Wompi? El flow PSE dejara de funcionar.")) return;
    setRemoving(true);
    setSaveBanner(null);
    try {
      const res = await removeWompiConfigAction({ propertyId });
      if (!res.ok) {
        setSaveBanner(res.error);
        return;
      }
      setSaveBanner("Eliminada.");
      form.reset({ environment: "production", publicKey: "", privateKey: "", eventsSecret: "" });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <section className="mt-9">
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
          Ambiente
        </span>
        <Controller
          control={control}
          name="environment"
          render={({ field }) => (
            <div className="flex flex-col sm:flex-row gap-2" role="radiogroup">
              <EnvOption
                active={field.value === "sandbox"}
                onClick={() => field.onChange("sandbox")}
                title="Sandbox"
                description="Para probar sin cobrar dinero real."
              />
              <EnvOption
                active={field.value === "production"}
                onClick={() => field.onChange("production")}
                title="Producción"
                description="Recibes pagos reales de tus huéspedes."
              />
            </div>
          )}
        />
      </section>

      <section className="mt-9">
        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-3.5">
          Credenciales
        </span>

        <FieldShell label="Public key" error={errors.publicKey?.message}>
          <Input
            {...register("publicKey")}
            className="font-mono text-[14px] tracking-[-0.01em]"
            autoComplete="off"
            placeholder="pub_prod_…"
          />
        </FieldShell>

        <SecretInput
          label="Private key"
          error={errors.privateKey?.message}
          placeholder={initial?.hasPrivateKey ? "•••• guardado (re-pegar para cambiar)" : "prv_prod_…"}
          {...register("privateKey")}
        />
        <SecretInput
          label="Events secret"
          subtitle="para webhooks"
          error={errors.eventsSecret?.message}
          placeholder={initial?.hasEventsSecret ? "•••• guardado (re-pegar para cambiar)" : "evt_prod_…"}
          {...register("eventsSecret")}
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

        {saveBanner && (
          <div
            role="status"
            className="flex gap-2.5 px-4 py-3 rounded-[10px] mt-3 text-sm leading-[1.45] text-ink bg-sage-tint border-l-[3px] border-sage"
          >
            {saveBanner}
          </div>
        )}
      </section>

      <section className="mt-9">
        <WebhookInfoBlock url={webhookUrl} />
      </section>

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}

function EnvOption({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "flex-1 flex items-center gap-2.5 rounded-[14px] text-left transition-[border-color,background-color,padding] duration-200",
        active
          ? "border-2 border-sage bg-[rgba(229,237,229,0.35)] px-[17px] py-[13px]"
          : "border border-rule bg-paper px-[18px] py-3.5 hover:border-rule-strong",
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
        <p className="text-[14px] font-medium text-ink m-0 mb-0.5">{title}</p>
        <p className="text-[12px] text-ink-muted m-0">{description}</p>
      </div>
    </button>
  );
}

type SecretProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  subtitle?: string;
  error?: string;
};

const SecretInput = forwardRef<HTMLInputElement, SecretProps>(function SecretInput(
  { label, subtitle, error, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <FieldShell label={subtitle ? `${label} — ${subtitle}` : label} error={error}>
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

function WebhookInfoBlock({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="bg-linen rounded-[14px] p-5">
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
        Webhook URL
      </span>
      <div className="flex items-center gap-2.5 mb-2.5">
        <code className="flex-1 min-w-0 bg-paper border border-rule rounded-[10px] px-3 py-2 font-mono text-xs text-ink-soft tracking-[-0.01em] overflow-hidden text-ellipsis whitespace-nowrap">
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-paper border border-rule text-ink-soft text-xs font-medium hover:bg-cream hover:text-ink transition-colors shrink-0"
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x={8} y={8} width={13} height={13} rx={2} />
            <path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
          </svg>
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="text-xs text-ink-muted leading-[1.55] m-0">
        Configura esta URL en tu cuenta de Wompi (Configuración → Eventos) para recibir confirmaciones de pago automáticas.
      </p>
    </div>
  );
}
