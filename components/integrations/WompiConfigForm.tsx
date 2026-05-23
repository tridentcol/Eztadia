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

const schema = z.object({
  environment: z.enum(["sandbox", "production"]),
  publicKey: z.string().min(8, "Public key requerida."),
  privateKey: z.string().min(8, "Private key requerida."),
  eventsSecret: z.string().min(8, "Events secret requerido."),
});

type Values = z.infer<typeof schema>;

const DEMO_DEFAULTS: Values = {
  environment: "production",
  publicKey: "pub_prod_kKj2N8Mq3RsT4uVw5xYz",
  privateKey: "prv_prod_aBcDeFgHiJkLmNoPqRsTuVwXyZ",
  eventsSecret: "evt_prod_3sCr3tWh00ksH1y8",
};

export function WompiConfigForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: DEMO_DEFAULTS,
  });
  const { register, control, formState } = form;
  const { errors } = formState;

  const [testState, setTestState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; latencyMs: number }
    | { kind: "error"; message: string }
  >({ kind: "success", latencyMs: 187 });

  async function testConnection() {
    setTestState({ kind: "loading" });
    await new Promise((r) => setTimeout(r, 500));
    setTestState({ kind: "success", latencyMs: 187 });
  }

  async function onSave(_v: Values) {
    await new Promise((r) => setTimeout(r, 250));
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
          />
        </FieldShell>

        <SecretInput
          label="Private key"
          error={errors.privateKey?.message}
          {...register("privateKey")}
        />
        <SecretInput
          label="Events secret"
          subtitle="para webhooks"
          error={errors.eventsSecret?.message}
          {...register("eventsSecret")}
        />

        <button
          type="button"
          onClick={testConnection}
          disabled={testState.kind === "loading"}
          className="mt-1 inline-flex items-center gap-2 h-10 px-[18px] rounded-xl bg-transparent text-sage border border-sage text-sm font-medium hover:bg-sage-tint disabled:opacity-60 transition-colors"
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
          {testState.kind === "loading" ? "Probando…" : "Probar conexión"}
        </button>

        {testState.kind === "success" && (
          <div
            role="status"
            className="flex gap-2.5 px-4 py-3 rounded-[10px] mt-3 text-sm leading-[1.45] text-ink bg-sage-tint border-l-[3px] border-sage"
          >
            <svg className="w-4 h-4 text-sage shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={9} />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>
              Conexión exitosa. Wompi respondió en{" "}
              <span className="oldstyle">{testState.latencyMs}</span> ms.
            </span>
          </div>
        )}
        {testState.kind === "error" && (
          <div
            role="alert"
            className="flex gap-2.5 px-4 py-3 rounded-[10px] mt-3 text-sm leading-[1.45] text-ink bg-[rgba(199,111,76,0.12)] border-l-[3px] border-clay"
          >
            <svg className="w-4 h-4 text-clay shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>{testState.message}</span>
          </div>
        )}
      </section>

      <section className="mt-9">
        <WebhookInfoBlock />
      </section>

      <SaveBar form={form} onSave={onSave} />
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

function WebhookInfoBlock() {
  const [copied, setCopied] = useState(false);
  const url = "https://eztadia.com/api/webhooks/wompi/casa-marina";
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
