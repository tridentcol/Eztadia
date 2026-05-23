"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldShell, TextField, PasswordField, Checkbox } from "./fields";
import { IconMail, IconUser, IconChevronDown, FlagCO } from "./icons";
import { PasswordStrength, computeStrength } from "./PasswordStrength";
import { ErrorBanner } from "./Banner";
import { Turnstile } from "./Turnstile";
import { signUpAction } from "@/lib/auth/actions";

const schema = z.object({
  fullName: z.string().min(3, "Tu nombre completo, por favor."),
  email: z.string().email("Email inválido."),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: "Mezcla letras y números.",
    }),
  phonePrefix: z.string().default("+57"),
  phone: z.string().min(7, "Teléfono incompleto."),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Tenemos que pedir tu aceptación." }),
  }),
});

type Values = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [accept, setAccept] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phonePrefix: "+57",
      phone: "",
      acceptTerms: false as true,
    },
  });

  const password = watch("password") ?? "";

  async function onSubmit(values: Values) {
    setErrorMsg(null);
    const result = await signUpAction({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phone: values.phone,
      phonePrefix: values.phonePrefix,
      turnstileToken,
    });
    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }
    if (result.needsEmailConfirm) {
      setSentToEmail(values.email);
      return;
    }
    router.push("/onboarding");
  }

  if (sentToEmail) {
    return (
      <div className="text-center">
        <h2 className="font-serif italic font-medium text-[clamp(24px,3vw,28px)] text-ink m-0 mb-3 tracking-[-0.025em]">
          Revisa tu correo.
        </h2>
        <p className="text-sm leading-[1.55] text-ink-soft max-w-[42ch] mx-auto m-0">
          Te enviamos un link de verificacion a <strong className="font-medium">{sentToEmail}</strong>.
          Confirma para entrar a tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errorMsg && <ErrorBanner>{errorMsg}</ErrorBanner>}

      <FieldShell label="Nombre completo" error={errors.fullName?.message}>
        <TextField
          {...register("fullName")}
          autoComplete="name"
          placeholder="Carlos San Juan"
          iconLeft={<IconUser className="w-4 h-4" />}
        />
      </FieldShell>

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
        helper={<PasswordStrength password={password} />}
      >
        <PasswordField
          {...register("password")}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          aria-describedby="pw-strength"
        />
      </FieldShell>

      <FieldShell label="Teléfono" error={errors.phone?.message}>
        <div
          className={[
            "flex h-12 rounded-[10px] overflow-hidden bg-paper border transition-shadow",
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
            {watch("phonePrefix")}
            <IconChevronDown className="w-2.5 h-2.5 text-ink-muted" />
          </button>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel-national"
            placeholder="311 222 3344"
            className="flex-1 border-0 outline-0 bg-transparent px-3.5 text-[15px] text-ink placeholder:text-ink-muted"
          />
        </div>
      </FieldShell>

      <Checkbox checked={accept} onChange={setAccept} invalid={!!errors.acceptTerms}>
        Acepto los{" "}
        <a href="#terms" className="underline underline-offset-[3px] decoration-sage decoration-1 hover:text-sage">
          términos y condiciones
        </a>{" "}
        y la{" "}
        <a href="#privacy" className="underline underline-offset-[3px] decoration-sage decoration-1 hover:text-sage">
          política de privacidad
        </a>
        .
      </Checkbox>
      <input type="hidden" {...register("acceptTerms")} value={accept ? "true" : ""} />
      {errors.acceptTerms?.message && (
        <p className="ml-7 mt-1.5 text-xs text-danger">{errors.acceptTerms.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || computeStrength(password) < 2}
        className="w-full h-12 mt-[18px] rounded-[14px] bg-terracotta text-cream text-sm font-medium hover:bg-clay active:scale-[0.99] transition-[background-color,transform] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creando cuenta…" : "Crear mi cuenta"}
      </button>

      <Turnstile onToken={setTurnstileToken} className="mt-5" />
    </form>
  );
}
