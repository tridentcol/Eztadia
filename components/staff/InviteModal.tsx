"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROLE_OPTIONS, type StaffRole } from "@/lib/staff";
import { IconClose } from "./icons";

const schema = z.object({
  email: z.string().email("Email inválido."),
  role: z.enum(["owner", "manager", "reception"]),
  message: z.string().max(500, "Demasiado largo.").optional(),
});

type Values = z.infer<typeof schema>;

export function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "reception", message: "" },
  });

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function onSubmit(_values: Values) {
    // In production: POST to /api/staff/invite.
    await new Promise((r) => setTimeout(r, 250));
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8 overflow-y-auto">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="relative z-[101] w-full max-w-[520px] bg-paper rounded-[28px] p-8 sm:p-10"
        style={{ boxShadow: "var(--shadow-modal, var(--shadow-pop))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconClose className="w-4 h-4" />
        </button>

        <h2
          id="invite-title"
          className="font-serif italic font-medium text-[24px] sm:text-[28px] text-ink m-0 mb-2 tracking-[-0.02em]"
        >
          Invitar a tu equipo
        </h2>
        <p className="text-sm text-ink-muted m-0 mb-7 leading-[1.55]">
          Le enviaremos un link por email para que cree su cuenta y se una al equipo de{" "}
          <em className="italic">Casa Marina</em>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-5">
            <label htmlFor="invite-email" className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              autoComplete="email"
              {...register("email")}
              placeholder="maria@casamarina.co"
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[15px] text-ink outline-0 placeholder:text-ink-muted transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            />
            {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="mb-5">
            <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2">
              Rol
            </span>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="flex flex-col gap-2.5" role="radiogroup">
                  {ROLE_OPTIONS.map((opt) => {
                    const active = field.value === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => field.onChange(opt.key as StaffRole)}
                        className={[
                          "relative flex gap-3.5 text-left rounded-2xl transition-[border-color,background-color,padding] duration-200",
                          active
                            ? "border-2 border-sage bg-[rgba(229,237,229,0.35)] px-[17px] py-[15px]"
                            : "border border-rule bg-paper px-[18px] py-4 hover:border-rule-strong",
                        ].join(" ")}
                      >
                        <span
                          aria-hidden
                          className={[
                            "w-4 h-4 rounded-full mt-[3px] flex-shrink-0",
                            active
                              ? "border-[1.5px] border-sage bg-[radial-gradient(circle,var(--color-sage)_0_4px,transparent_4px)]"
                              : "border-[1.5px] border-rule-strong bg-paper",
                          ].join(" ")}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif italic font-medium text-[17px] text-ink m-0 mb-2 tracking-[-0.005em]">
                            {opt.title}{" "}
                            <span className="text-ink-muted not-italic font-normal text-[13px]" style={{ fontStyle: "normal" }}>
                              — {opt.subtitle}
                            </span>
                          </h3>
                          <ul className="list-none p-0 m-0 flex flex-col gap-[5px]">
                            {opt.bullets.map((b, i) => (
                              <li key={i} className="text-[12.5px] text-ink-soft leading-[1.45] pl-3 relative before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-ink-muted">
                                {b}
                              </li>
                            ))}
                          </ul>
                          {opt.footer && (
                            <p
                              className={[
                                "mt-2.5 text-[11px] font-medium tracking-[0.04em] m-0",
                                opt.footer.tone === "warning" ? "text-warning" : "text-ink-muted",
                              ].join(" ")}
                            >
                              {opt.footer.text}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <div className="mb-7">
            <label
              htmlFor="invite-message"
              className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-2"
            >
              Mensaje personal{" "}
              <span className="font-normal normal-case tracking-normal text-ink-muted">— opcional</span>
            </label>
            <textarea
              id="invite-message"
              rows={3}
              {...register("message")}
              placeholder="¡Hola María! Bienvenida al equipo de Casa Marina..."
              className="w-full min-h-[88px] bg-paper border border-rule-strong rounded-[10px] px-3.5 py-3 text-sm text-ink outline-0 placeholder:text-ink-muted leading-[1.55] resize-y transition-[border-color,box-shadow] focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            />
            <p className="mt-2 text-xs text-ink-muted">Aparecerá en el email de invitación.</p>
          </div>

          <div className="flex justify-between items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-60"
            >
              {isSubmitting ? "Enviando…" : "Enviar invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
