"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldShell, TextField } from "./fields";
import { IconMail, IconPaperPlane, IconChevronLeft } from "./icons";
import { Turnstile } from "./Turnstile";
import { resetPasswordRequestAction } from "@/lib/auth/actions";

const schema = z.object({
  email: z.string().email("Email inválido."),
});

type Values = z.infer<typeof schema>;

export function ResetRequestForm() {
  const [sent, setSent] = useState<{ email: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    await resetPasswordRequestAction({
      email: values.email,
      turnstileToken,
    });
    // Siempre marcamos enviado — no filtramos existencia de cuentas.
    setSent({ email: values.email });
  }

  if (sent) {
    return (
      <div className="text-center">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-tint text-sage mb-6 relative"
        >
          <IconPaperPlane className="w-8 h-8" />
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full border border-[rgba(92,117,103,0.18)]"
          />
        </span>
        <h1 className="font-serif italic font-medium text-[clamp(28px,4vw,32px)] text-ink m-0 mb-3 tracking-[-0.025em]">
          Revisa tu correo.
        </h1>
        <p className="text-sm leading-[1.55] text-ink-soft max-w-[42ch] mx-auto m-0">
          Si <strong className="font-medium">{sent.email}</strong> existe en Eztadia, te enviamos un link. Expira en{" "}
          <span className="oldstyle">1</span> hora.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage transition-colors"
        >
          <IconChevronLeft className="w-3 h-3" />
          Volver al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldShell label="Email" error={errors.email?.message}>
        <TextField
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="carlos@casamarina.co"
          iconLeft={<IconMail className="w-4 h-4" />}
        />
      </FieldShell>

      <Turnstile onToken={setTurnstileToken} className="mt-5" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 mt-4 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando…" : "Enviar link"}
      </button>
    </form>
  );
}
