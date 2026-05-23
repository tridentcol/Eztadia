"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldShell, TextField, PasswordField, Checkbox } from "./fields";
import { IconMail } from "./icons";
import { ErrorBanner } from "./Banner";
import { Turnstile } from "./Turnstile";
import { signInAction } from "@/lib/auth/actions";

const schema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Falta tu contraseña."),
  remember: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: Values) {
    setErrorMsg(null);
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";
    const result = await signInAction({
      email: values.email,
      password: values.password,
      redirectTo,
      turnstileToken,
    });
    // signInAction llama redirect() en exito — solo llegamos aqui en error.
    if (!result.ok) {
      setErrorMsg(result.error);
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errorMsg && (
        <ErrorBanner>
          {errorMsg}{" "}
          <Link
            href="/reset-password"
            className="text-sage underline underline-offset-[3px] decoration-1"
          >
            recupera tu contraseña
          </Link>
          .
        </ErrorBanner>
      )}

      <FieldShell label="Email" error={errors.email?.message}>
        <TextField
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="carlos@casamarina.co"
          iconLeft={<IconMail className="w-4 h-4" />}
        />
      </FieldShell>

      <FieldShell
        label="Contraseña"
        error={errors.password?.message}
        trailing={
          <Link
            href="/reset-password"
            className="text-[12px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        }
      >
        <PasswordField
          {...register("password")}
          autoComplete="current-password"
          placeholder="Tu contraseña"
        />
      </FieldShell>

      <Checkbox checked={remember} onChange={setRemember}>
        Recordarme en este equipo
      </Checkbox>
      <input type="hidden" {...register("remember", { value: remember })} />

      <Turnstile key={turnstileResetKey} onToken={setTurnstileToken} className="mt-5" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 mt-4 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Entrando…" : "Continuar"}
      </button>

      <div className="flex items-center my-[22px] text-ink-muted text-[13px]">
        <span aria-hidden className="flex-1 h-px bg-rule" />
        <span className="px-3.5">o</span>
        <span aria-hidden className="flex-1 h-px bg-rule" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/login?magic=1")}
        disabled
        title="Magic link estara disponible en una proxima version"
        className="w-full h-12 rounded-[14px] bg-paper border border-rule-strong text-ink hover:bg-linen hover:border-ink-muted transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconMail className="w-[14px] h-[14px]" />
        Recibe un magic link
      </button>
    </form>
  );
}
