"use client";

import { forwardRef, useEffect, type InputHTMLAttributes, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { OnboardingHeader, TipCard } from "./OnboardingShell";
import { OnboardingStepper } from "./Stepper";
import { FlagCO, IconChevronDown, IconArrowRight } from "./icons";

const schema = z.object({
  name: z.string().min(2, "Tu nombre comercial, por favor."),
  billingEmail: z.string().email("Email inválido."),
  country: z.string().min(2),
});

/* ─── shared primitives, exported for other steps ─── */

export function FieldShell({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-[22px]">
      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2">
        {label}
      </span>
      {children}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {!error && helper && (
        <p className="mt-2 text-xs text-ink-muted leading-[1.55]">{helper}</p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        {...rest}
        className={[
          "w-full h-12 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[15px] text-ink outline-0 placeholder:text-ink-muted",
          "transition-[border-color,box-shadow] duration-200 ease-organic",
          "focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]",
          className,
        ].join(" ")}
      />
    );
  },
);

/* ─── step 1 form ─── */

export function Step1OrgForm() {
  const org = useOnboardingStore((s) => s.org);
  const setOrg = useOnboardingStore((s) => s.setOrg);
  const next = useOnboardingStore((s) => s.next);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: org,
  });

  const values = watch();
  useEffect(() => {
    const sub = watch((data) => setOrg(data as typeof org));
    return () => sub.unsubscribe();
  }, [watch, setOrg]);

  return (
    <form onSubmit={handleSubmit(() => next())} noValidate className="flex flex-col">
      <OnboardingStepper current={1} />

      <OnboardingHeader
        eyebrow="Primer paso"
        title={
          <>
            Empecemos por <em className="italic">quién eres</em>.
          </>
        }
        subtitle="Esto será visible en tus reservas y facturas. Puedes editarlo después."
      />

      <FieldShell
        label="Nombre comercial"
        error={errors.name?.message}
        helper="Puede ser el nombre de tu hotel, tu razón social o un nombre comercial."
      >
        <Input {...register("name")} placeholder="Casa Marina S.A.S." autoComplete="organization" />
      </FieldShell>

      <FieldShell
        label="Email para facturación"
        error={errors.billingEmail?.message}
        helper="Diferente al email de tu cuenta. Para enviar facturas y recibos de Eztadia."
      >
        <Input
          {...register("billingEmail")}
          type="email"
          placeholder="facturacion@casamarina.co"
          autoComplete="email"
        />
      </FieldShell>

      <FieldShell
        label="País de operación"
        helper="Define la moneda por defecto, formatos de fecha y métodos de pago disponibles."
      >
        <button
          type="button"
          className="flex items-center gap-2.5 h-12 bg-paper border border-rule-strong rounded-[10px] px-3.5 w-full text-left transition-colors hover:bg-cream"
        >
          <FlagCO className="rounded-sm border border-rule" />
          <span className="flex-1 text-[15px] text-ink">{values.country}</span>
          <IconChevronDown className="w-3 h-3 text-ink-muted" />
        </button>
      </FieldShell>

      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={() => next()}
          className="text-[13px] font-medium text-ink-muted hover:text-ink transition-colors px-2 h-[52px]"
        >
          Saltar por ahora
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center gap-2 h-[52px] px-6 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
          <IconArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

export function Step1Tips() {
  return (
    <TipCard eyebrow="Por si te preguntas" title="¿Necesito una empresa registrada?" withOrnament>
      No. Puedes usar Eztadia con cualquier nombre comercial — un proyecto personal, una sociedad, o tu nombre propio. Lo importante es que sea consistente con cómo te conocen tus huéspedes.
    </TipCard>
  );
}
