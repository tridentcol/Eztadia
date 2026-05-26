"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BookingHold, DocumentType } from "@/lib/booking-flow";
import { DOCUMENT_LABEL } from "@/lib/booking-flow";
import { publicCreateHoldAction } from "@/app/actions/public-booking";
import { Turnstile } from "@/components/auth/Turnstile";
import {
  IconLock,
  IconChevronDown,
  IconArrowRight,
  IconCheckSimple,
  FlagCO,
  PSEBadge,
} from "./icons";

export type BookingFormContext = {
  propertyId: string;
  roomTypeId: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  adults: number;
  children: number;
};

const formSchema = z.object({
  fullName: z
    .string()
    .min(3, "Tu nombre completo, por favor.")
    .max(120, "Demasiado largo."),
  documentType: z.enum(["CC", "CE", "PA"]),
  documentNumber: z
    .string()
    .min(5, "Falta el número de documento.")
    .max(40),
  email: z.string().email("Email inválido."),
  phonePrefix: z.string().default("+57"),
  phone: z
    .string()
    .min(7, "Faltan dígitos en el teléfono.")
    .max(20),
  country: z.string().default("Colombia"),
  paymentMethod: z.enum(["pse", "manual"]).default("pse"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Tenemos que pedir tu aceptación, sin esto no podemos." }),
  }),
});

export type BookingFormValues = z.infer<typeof formSchema>;

export function BookingForm({
  hold,
  context,
  bankAvailable = true,
}: {
  hold: BookingHold;
  context?: BookingFormContext;
  bankAvailable?: boolean;
}) {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentType: "CC",
      documentNumber: "",
      email: "",
      phonePrefix: "+57",
      phone: "",
      country: "Colombia",
      paymentMethod: "pse",
      acceptTerms: false as true,
    },
  });

  const paymentMethod = watch("paymentMethod");
  const acceptTerms = watch("acceptTerms");

  async function onSubmit(values: BookingFormValues) {
    // Sin context: fallback al comportamiento legacy (preview demo).
    if (!context) {
      router.push(`/p/${hold.property.slug}/booking/${hold.id}/pay?m=${values.paymentMethod}`);
      return;
    }

    // Normaliza phone a E.164: junta prefix + digitos del input.
    const phoneDigits = values.phone.replace(/[^\d]/g, "");
    const guestPhone = `${values.phonePrefix}${phoneDigits}`;
    // Mapea "manual" (UI) → "manual_transfer" (DB enum + action schema).
    const paymentForAction: "pse" | "manual_transfer" =
      values.paymentMethod === "pse" ? "pse" : "manual_transfer";
    // Mapea documentType "PA" (UI) → "passport" (action schema).
    const documentForAction: "CC" | "CE" | "passport" =
      values.documentType === "PA" ? "passport" : values.documentType;

    const payload = {
      propertyId: context.propertyId,
      roomTypeId: context.roomTypeId,
      checkIn: context.checkIn,
      checkOut: context.checkOut,
      adults: context.adults,
      children: context.children,
      guestFullName: values.fullName,
      guestEmail: values.email,
      guestPhone,
      guestDocumentType: documentForAction,
      guestDocumentNumber: values.documentNumber,
      paymentMethod: paymentForAction,
      acceptTerms: true as const,
      turnstileToken,
    };

    const res = await publicCreateHoldAction(payload);
    if (!res.ok) {
      setError("root", { message: res.error });
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
      return;
    }
    router.push(`/p/${hold.property.slug}/booking/${res.data.holdId}/pay`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Nombre completo" error={errors.fullName?.message} fullWidth>
          <input
            {...register("fullName")}
            type="text"
            autoComplete="name"
            placeholder="Andrea Mendoza García"
            className="form-input"
          />
        </FieldRow>

        <FieldRow label="Tipo de documento" error={errors.documentType?.message}>
          <div className="relative">
            <select {...register("documentType")} className="form-input appearance-none pr-9 cursor-pointer">
              {(Object.keys(DOCUMENT_LABEL) as DocumentType[]).map((k) => (
                <option key={k} value={k}>
                  {DOCUMENT_LABEL[k]}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none" />
          </div>
        </FieldRow>

        <FieldRow label="Número" error={errors.documentNumber?.message}>
          <input
            {...register("documentNumber")}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1.024.567.890"
            className="form-input"
          />
        </FieldRow>

        <FieldRow label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="andrea.m@gmail.com"
            className="form-input"
          />
        </FieldRow>

        <FieldRow label="Teléfono" error={errors.phone?.message}>
          <div
            className={[
              "flex h-12 rounded-[10px] border overflow-hidden bg-paper transition-shadow",
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
              placeholder="311 234 5678"
              className="flex-1 outline-0 border-0 bg-transparent px-3.5 text-[15px] text-ink placeholder:text-ink-muted"
            />
          </div>
        </FieldRow>

        <FieldRow label="País de residencia" fullWidth>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(field.value)}
                className="form-input cursor-pointer flex items-center gap-2.5 text-left"
              >
                <FlagCO className="rounded-sm border border-rule" />
                <span className="flex-1 text-[15px] text-ink">{field.value}</span>
                <IconChevronDown className="w-3 h-3 text-ink-muted" />
              </button>
            )}
          />
        </FieldRow>
      </div>

      {/* Payment method */}
      <header className="mt-10 mb-3">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
          Cómo pagas
        </span>
        <h2 className="font-serif italic font-medium text-[22px] m-0 tracking-[-0.015em]">
          Elige tu método.
        </h2>
      </header>

      <div
        className={`grid grid-cols-1 ${
          bankAvailable ? "sm:grid-cols-2" : ""
        } gap-3.5`}
      >
        <PayMethodCard
          selected={paymentMethod === "pse"}
          onSelect={() => setValue("paymentMethod", "pse", { shouldDirty: true })}
          logo={<PSEBadge variant="color" />}
          title="Pagar con PSE"
          description="Pago inmediato desde tu banco colombiano. Tu reserva queda confirmada al instante."
          foot="Vía Wompi · Seguro y autorizado"
          tag={bankAvailable ? "Recomendado" : undefined}
        />
        {bankAvailable && (
          <PayMethodCard
            selected={paymentMethod === "manual"}
            onSelect={() => setValue("paymentMethod", "manual", { shouldDirty: true })}
            logo={
              <span className="inline-flex items-center gap-2 text-ink-muted text-[12px]">
                <BankDot color="#FDDA24" outline />
                <BankDot color="#ED1C24" />
                <BankDot color="#004481" />
                <BankDot color="#0F4D9E" />
              </span>
            }
            title="Transferencia bancaria"
            description="Transfiere y sube tu comprobante. Confirmamos tu reserva en menos de 24 horas."
            foot="Bancolombia · Davivienda · BBVA"
          />
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 mt-8 cursor-pointer">
        <input
          {...register("acceptTerms")}
          type="checkbox"
          className="sr-only"
          aria-invalid={!!errors.acceptTerms}
        />
        <span
          className={[
            "w-5 h-5 flex-shrink-0 rounded-md inline-flex items-center justify-center mt-0.5 transition-colors",
            acceptTerms
              ? "bg-sage border border-sage"
              : "bg-paper border-[1.5px] border-rule-strong",
            errors.acceptTerms && !acceptTerms ? "border-danger" : "",
          ].join(" ")}
        >
          {acceptTerms && <IconCheckSimple className="w-3 h-3 text-cream" />}
        </span>
        <span className="text-sm text-ink leading-relaxed">
          Acepto los{" "}
          <a className="underline underline-offset-[3px] decoration-sage decoration-1 hover:text-sage" href="#terms">
            términos y condiciones
          </a>{" "}
          y la{" "}
          <a className="underline underline-offset-[3px] decoration-sage decoration-1 hover:text-sage" href="#privacy">
            política de privacidad
          </a>{" "}
          de <em className="italic">{hold.property.name}</em>.
        </span>
      </label>
      {errors.acceptTerms?.message && (
        <p className="ml-8 mt-1.5 text-xs text-danger">{errors.acceptTerms.message}</p>
      )}

      {errors.root?.message && (
        <p
          role="alert"
          className="mt-6 text-xs text-danger border border-danger/30 bg-danger/5 rounded-md px-3 py-2"
        >
          {errors.root.message}
        </p>
      )}

      <Turnstile key={turnstileResetKey} onToken={setTurnstileToken} className="mt-6" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full h-14 rounded-[14px] bg-terracotta text-cream font-serif font-medium text-[17px] tracking-[-0.01em] hover:bg-clay active:scale-[0.99] transition-[background-color,transform] duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {isSubmitting ? "Procesando…" : "Continuar al pago"}
        <IconArrowRight className="w-3.5 h-3.5" />
      </button>

      <p className="mt-4 inline-flex items-center justify-center gap-2 w-full text-xs text-ink-muted">
        <IconLock className="w-3.5 h-3.5" />
        Tu información viaja cifrada. No guardamos datos de pago.
      </p>

      <style jsx>{`
        :global(.form-input) {
          height: 48px;
          width: 100%;
          background: var(--color-paper);
          border: 1px solid var(--color-rule-strong);
          border-radius: 10px;
          padding: 0 14px;
          font: 400 15px Inter, system-ui, sans-serif;
          color: var(--color-ink);
          outline: 0;
          transition: border-color 200ms cubic-bezier(0.32, 0.72, 0, 1),
            box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1);
        }
        :global(.form-input::placeholder) {
          color: var(--color-ink-muted);
        }
        :global(.form-input:focus) {
          border-color: var(--color-sage);
          box-shadow: 0 0 0 3px var(--color-sage-tint);
        }
      `}</style>
    </form>
  );
}

function FieldRow({
  label,
  error,
  children,
  fullWidth = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

function PayMethodCard({
  selected,
  onSelect,
  logo,
  title,
  description,
  foot,
  tag,
}: {
  selected: boolean;
  onSelect: () => void;
  logo: React.ReactNode;
  title: string;
  description: string;
  foot: string;
  tag?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "relative text-left rounded-[20px] transition-[border-color,background-color,padding] duration-200 min-h-[200px] flex flex-col",
        selected
          ? "border-2 border-sage bg-[rgba(229,237,229,0.4)] p-[23px]"
          : "border border-rule bg-paper p-6 hover:border-rule-strong",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute top-4 right-4 w-[18px] h-[18px] rounded-full",
          selected
            ? "border-[1.5px] border-sage bg-[radial-gradient(circle,var(--color-sage)_0_5px,transparent_5px_100%)]"
            : "border-[1.5px] border-rule-strong bg-paper",
        ].join(" ")}
      />
      <span className="h-7 mb-4 flex items-center">{logo}</span>
      <h3 className="font-serif italic font-medium text-[18px] text-ink m-0 mb-2 tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-sm text-ink-soft leading-[1.5] m-0">{description}</p>
      <p className="mt-auto pt-4 text-[11px] font-medium tracking-[0.06em] uppercase text-ink-muted">
        {foot}
      </p>
      {tag && (
        <span className="absolute bottom-3 right-3 bg-sage-tint text-sage text-[10px] font-medium tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border border-[rgba(92,117,103,0.18)]">
          {tag}
        </span>
      )}
    </button>
  );
}

function BankDot({ color, outline = false }: { color: string; outline?: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{
        background: color,
        border: outline ? "1px solid rgba(0,0,0,0.06)" : undefined,
      }}
    />
  );
}
