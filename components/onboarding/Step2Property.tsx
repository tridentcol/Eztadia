"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore, slugify } from "@/lib/onboarding-store";
import type { PropertyType } from "@/lib/onboarding-store";
import { OnboardingHeader, TipCard } from "./OnboardingShell";
import { OnboardingStepper } from "./Stepper";
import { FieldShell, Input } from "./Step1Org";
import { TypeRadioCards } from "./TypeRadioCards";
import { PhotoUpload } from "./PhotoUpload";
import { IconArrowRight } from "./icons";

const schema = z.object({
  name: z.string().min(2, "Tu propiedad necesita un nombre."),
  slug: z
    .string()
    .min(2, "Demasiado corto.")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones."),
  type: z.enum(["hotel", "building", "complex"], {
    errorMap: () => ({ message: "Elige un tipo." }),
  }),
  city: z.string().min(2, "¿En qué ciudad está?"),
  description: z.string().max(280, "Demasiado largo."),
});

export function Step2PropertyForm({ onBack }: { onBack: () => void }) {
  const property = useOnboardingStore((s) => s.property);
  const setProperty = useOnboardingStore((s) => s.setProperty);
  const addPhoto = useOnboardingStore((s) => s.addPhoto);
  const removePhoto = useOnboardingStore((s) => s.removePhoto);
  const next = useOnboardingStore((s) => s.next);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: property.name,
      slug: property.slug || "",
      type: (property.type || "hotel") as Exclude<PropertyType, "">,
      city: property.city,
      description: property.description,
    },
  });

  // Auto-slug from name unless user edited it manually
  const slugTouchedRef = useRef(false);
  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  useEffect(() => {
    if (!slugTouchedRef.current) {
      const auto = slugify(watchedName);
      if (auto !== watchedSlug) setValue("slug", auto, { shouldValidate: true });
    }
  }, [watchedName, watchedSlug, setValue]);

  const values = watch();
  // Persist live (subscription pattern — evita loop por nueva ref de watch() cada render)
  useEffect(() => {
    const sub = watch((data) => setProperty(data as Partial<typeof property>));
    return () => sub.unsubscribe();
  }, [watch, setProperty]);

  return (
    <form
      onSubmit={handleSubmit(() => next())}
      noValidate
      className="flex flex-col"
    >
      <OnboardingStepper current={2} />

      <OnboardingHeader
        eyebrow="Segundo paso"
        title={<>Cuéntanos de <em className="italic">tu propiedad</em>.</>}
        subtitle="Lo básico para crear su página pública. Después la editas con calma."
      />

      <FieldShell label="Nombre de la propiedad" error={errors.name?.message} helper="Como la conocen tus huéspedes.">
        <Input {...register("name")} placeholder="Casa Marina" />
      </FieldShell>

      <FieldShell
        label="URL pública"
        error={errors.slug?.message}
        helper="Esta será la URL pública de tu propiedad. Solo letras minúsculas, números y guiones."
      >
        <div
          className={[
            "flex h-12 rounded-[10px] overflow-hidden bg-paper border transition-shadow",
            "focus-within:border-sage focus-within:shadow-[0_0_0_3px_var(--color-sage-tint)]",
            errors.slug ? "border-danger" : "border-rule-strong",
          ].join(" ")}
        >
          <span className="inline-flex items-center px-3.5 border-r border-rule bg-linen text-ink-muted font-mono text-[13px] tracking-[-0.01em]">
            eztadia.com/p/
          </span>
          <input
            {...register("slug")}
            onChange={(e) => {
              slugTouchedRef.current = true;
              register("slug").onChange(e);
            }}
            placeholder="casa-marina"
            className="flex-1 border-0 outline-0 bg-transparent px-3.5 font-mono text-[15px] text-ink tracking-[-0.01em]"
          />
        </div>
      </FieldShell>

      <FieldShell label="Tipo de propiedad" error={errors.type?.message}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <>
              <div className="hidden sm:block">
                <TypeRadioCards value={field.value} onChange={field.onChange} variant="grid" />
              </div>
              <div className="sm:hidden">
                <TypeRadioCards value={field.value} onChange={field.onChange} variant="list" />
              </div>
            </>
          )}
        />
      </FieldShell>

      <FieldShell label="Ciudad" error={errors.city?.message}>
        <Input {...register("city")} placeholder="Cartagena, Colombia" />
      </FieldShell>

      <FieldShell
        label="Descripción corta"
        error={errors.description?.message}
        helper={
          <span>
            <span className="oldstyle">{values.description.length}</span>/280 caracteres · Aparecerá como subtítulo en tu página pública.
          </span>
        }
      >
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Cuéntanos brevemente sobre tu lugar. Lo puedes editar y ampliar después con descripción completa, fotos, amenities."
          className="w-full min-h-[108px] bg-paper border border-rule-strong rounded-[10px] px-3.5 py-3 text-[15px] text-ink outline-0 placeholder:text-ink-muted leading-[1.5] resize-y transition-[border-color,box-shadow] duration-200 ease-organic focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
        />
      </FieldShell>

      <FieldShell
        label="Hasta 5 fotos"
        helper="JPG o PNG · Máx 5 MB por foto · Recomendado: 1600px ancho · La primera es la portada"
      >
        <div className="hidden sm:block">
          <PhotoUpload photos={property.photos} onAdd={addPhoto} onRemove={removePhoto} variant="grid" />
        </div>
        <div className="sm:hidden">
          <PhotoUpload photos={property.photos} onAdd={addPhoto} onRemove={removePhoto} variant="scroll" />
        </div>
      </FieldShell>

      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-soft hover:text-ink transition-colors px-2 h-[52px]"
        >
          ← Atrás
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

export function Step2Tips() {
  return (
    <>
      <TipCard eyebrow="Tip" title="Sobre el slug">
        Usa algo corto y memorable como{" "}
        <code className="bg-linen rounded px-1.5 py-px text-[13px] font-mono tracking-[-0.01em]">
          casamarina
        </code>{" "}
        o{" "}
        <code className="bg-linen rounded px-1.5 py-px text-[13px] font-mono tracking-[-0.01em]">
          villaserena
        </code>
        . Lo vas a compartir mil veces en WhatsApp e Instagram.
      </TipCard>
      <TipCard eyebrow="Pro tip" title="La primera foto es la portada">
        Elige una imagen luminosa, horizontal, que muestre tu propiedad desde su mejor ángulo. Los huéspedes deciden en 3 segundos.
      </TipCard>
    </>
  );
}
