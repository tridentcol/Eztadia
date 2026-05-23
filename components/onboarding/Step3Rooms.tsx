"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { OnboardingHeader, TipCard } from "./OnboardingShell";
import { OnboardingStepper } from "./Stepper";
import { FieldShell, Input } from "./Step1Org";
import { NumberStepper } from "./NumberStepper";
import { IconArrowRight } from "./icons";

const schema = z.object({
  typeName: z.string().min(2, "Nombre del tipo, por favor."),
  beds: z.string().min(2, "Describe la cama o camas."),
  pricePerNight: z
    .number()
    .int("Sin decimales.")
    .positive("Ingresa un precio."),
});

export function Step3RoomsForm({ onBack }: { onBack: () => void }) {
  const rooms = useOnboardingStore((s) => s.rooms);
  const setRooms = useOnboardingStore((s) => s.setRooms);
  const next = useOnboardingStore((s) => s.next);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      typeName: rooms.typeName,
      beds: rooms.beds,
      pricePerNight: rooms.pricePerNight,
    },
  });

  const values = watch();
  useEffect(() => {
    const sub = watch((data) =>
      setRooms({
        typeName: data.typeName,
        beds: data.beds,
        pricePerNight: data.pricePerNight,
      }),
    );
    return () => sub.unsubscribe();
  }, [watch, setRooms]);

  const formatPrice = (n: number) =>
    n > 0 ? n.toLocaleString("es-CO") : "";

  const previewNumbers = Array.from({ length: rooms.quantity }, (_, i) => 101 + i);

  return (
    <form
      onSubmit={handleSubmit(() => next())}
      noValidate
      className="flex flex-col"
    >
      <OnboardingStepper current={3} />

      <OnboardingHeader
        eyebrow="Último paso"
        title={<>Tu primer <em className="italic">tipo de habitación</em>.</>}
        subtitle="Crea uno ahora. Después puedes agregar más tipos y habitaciones individuales desde el dashboard."
      />

      <FieldShell label="Nombre del tipo" error={errors.typeName?.message} helper='Como aparecerá en tu página pública. Ej: "Suite Marina", "Habitación Tropical".'>
        <Input {...register("typeName")} placeholder="Suite Marina" />
      </FieldShell>

      <FieldShell label="Capacidad">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CapacityCell
            label="Adultos"
            sub="Desde 13 años"
            value={rooms.adults}
            min={1}
            max={12}
            onChange={(v) => setRooms({ adults: v })}
          />
          <CapacityCell
            label="Niños"
            sub="Hasta 12 años"
            value={rooms.children}
            min={0}
            max={8}
            onChange={(v) => setRooms({ children: v })}
          />
        </div>
      </FieldShell>

      <FieldShell label="Configuración de camas" error={errors.beds?.message} helper="Texto libre. Lo verán los huéspedes.">
        <Input {...register("beds")} placeholder="1 cama King" />
      </FieldShell>

      <FieldShell
        label="Precio por noche"
        error={errors.pricePerNight?.message}
        helper="Precio base. Después puedes definir tarifas por temporada desde el dashboard."
      >
        <div
          className={[
            "flex h-12 rounded-[10px] overflow-hidden bg-paper border transition-shadow",
            "focus-within:border-sage focus-within:shadow-[0_0_0_3px_var(--color-sage-tint)]",
            errors.pricePerNight ? "border-danger" : "border-rule-strong",
          ].join(" ")}
        >
          <span className="inline-flex items-center px-3.5 border-r border-rule bg-linen text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
            COP&nbsp;$
          </span>
          <input
            inputMode="numeric"
            placeholder="450.000"
            value={formatPrice(values.pricePerNight)}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              setValue("pricePerNight", n, { shouldValidate: true, shouldDirty: true });
            }}
            className="flex-1 border-0 outline-0 bg-transparent px-3.5 font-serif font-medium text-[18px] text-ink"
            style={{
              fontVariantNumeric: "tabular-nums oldstyle-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          />
        </div>
      </FieldShell>

      <FieldShell label="Cantidad de este tipo">
        <div className="flex items-center justify-between bg-paper border border-rule rounded-[14px] px-4 py-3.5 gap-4">
          <span className="text-sm text-ink-soft">Habitaciones</span>
          <NumberStepper
            value={rooms.quantity}
            min={1}
            max={50}
            size="lg"
            onChange={(v) => setRooms({ quantity: v })}
            ariaLabel="Cantidad de habitaciones"
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted leading-[1.55]">
          Vamos a crear{" "}
          <span className="text-ink-soft font-medium oldstyle">{rooms.quantity}</span>{" "}
          {rooms.quantity === 1 ? "habitación individual" : "habitaciones individuales"} (
          {previewNumbers.slice(0, 3).map((n, i) => (
            <span key={n}>
              <code className="bg-linen rounded px-1.5 py-px text-[11px] font-mono tracking-[-0.01em]">{n}</code>
              {i < Math.min(2, previewNumbers.length - 1) ? " · " : ""}
            </span>
          ))}
          {previewNumbers.length > 3 ? " · …" : ""}
          ). Las renombras después.
        </p>
      </FieldShell>

      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-2 h-14"
        >
          ← Atrás
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="inline-flex items-center gap-2 h-14 px-6 rounded-[14px] bg-terracotta text-cream font-serif font-medium text-[17px] tracking-[-0.01em] hover:bg-clay active:scale-[0.99] transition-[background-color,transform] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Listo, llévame al dashboard
          <IconArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

function CapacityCell({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-paper border border-rule rounded-[14px] px-[18px] py-4">
      <div>
        <div className="text-[13px] font-medium text-ink">{label}</div>
        <div className="text-[11px] text-ink-muted mt-0.5">{sub}</div>
      </div>
      <NumberStepper
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        ariaLabel={label}
      />
    </div>
  );
}

export function Step3Tips() {
  return (
    <>
      <TipCard title="Más tipos después">
        Puedes tener cuantos tipos quieras: Suite, Estándar, Familiar, etc. Cada uno con su propio precio y descripción.
      </TipCard>
      <TipCard title="Bloqueo de fechas">
        Si una habitación va a estar en mantenimiento o reservada por otro canal, podrás bloquearla individualmente desde el calendario.
      </TipCard>
    </>
  );
}
