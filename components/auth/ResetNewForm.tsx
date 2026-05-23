"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldShell, PasswordField } from "./fields";
import { PasswordStrength, computeStrength } from "./PasswordStrength";
import { ErrorBanner } from "./Banner";
import { resetPasswordCompleteAction } from "@/lib/auth/actions";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
        message: "Mezcla letras y números.",
      }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden.",
  });

type Values = z.infer<typeof schema>;

export function ResetNewForm({ token }: { token: string }) {
  void token; // El token vive en la cookie de sesion creada por /auth/callback
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const password = watch("password") ?? "";

  async function onSubmit(values: Values) {
    setErrorMsg(null);
    const result = await resetPasswordCompleteAction({
      password: values.password,
      confirm: values.confirm,
    });
    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }
    router.push("/login?reset=ok");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errorMsg && <ErrorBanner>{errorMsg}</ErrorBanner>}

      <FieldShell
        label="Nueva contraseña"
        error={errors.password?.message}
        helper={<PasswordStrength password={password} />}
      >
        <PasswordField
          {...register("password")}
          autoComplete="new-password"
          placeholder="Algo memorable, no usado en otros lados"
        />
      </FieldShell>

      <FieldShell label="Confirma la contraseña" error={errors.confirm?.message}>
        <PasswordField
          {...register("confirm")}
          autoComplete="new-password"
          placeholder="Repite la contraseña"
        />
      </FieldShell>

      <button
        type="submit"
        disabled={isSubmitting || computeStrength(password) < 2}
        className="w-full h-12 mt-2 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
