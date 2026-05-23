"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualBookingAction } from "@/app/actions/booking";

type RoomTypeOption = {
  id: string;
  name: string;
  basePriceCents: number;
};

type FormState = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail: string;
  guestPhone: string;
  totalCents: number;
  paymentMethod: "manual_transfer" | "external" | "admin_override";
  notes: string;
};

function nightsBetween(ci: string, co: string): number {
  if (!ci || !co || ci >= co) return 0;
  const a = new Date(ci + "T00:00:00Z").getTime();
  const b = new Date(co + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function defaultForm(roomTypes: RoomTypeOption[]): FormState {
  const today = new Date();
  const ci = today.toISOString().slice(0, 10);
  const next = new Date(today.getTime() + 86_400_000);
  const co = next.toISOString().slice(0, 10);
  const first = roomTypes[0];
  return {
    roomTypeId: first?.id ?? "",
    checkIn: ci,
    checkOut: co,
    adults: 2,
    children: 0,
    guestFullName: "",
    guestEmail: "",
    guestPhone: "",
    totalCents: first ? first.basePriceCents : 0,
    paymentMethod: "manual_transfer",
    notes: "",
  };
}

export function NewBookingTrigger({
  propertyId,
  roomTypes,
}: {
  propertyId: string;
  roomTypes: RoomTypeOption[];
}) {
  const [open, setOpen] = useState(false);
  const disabled = roomTypes.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "Crea tipos de habitación primero" : undefined}
        className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl text-sm font-medium text-cream bg-terracotta hover:bg-clay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-[15px] h-[15px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Nueva reserva manual
      </button>

      {open && (
        <NewBookingDrawer
          propertyId={propertyId}
          roomTypes={roomTypes}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NewBookingDrawer({
  propertyId,
  roomTypes,
  onClose,
}: {
  propertyId: string;
  roomTypes: RoomTypeOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => defaultForm(roomTypes));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedRoomType = useMemo(
    () => roomTypes.find((rt) => rt.id === form.roomTypeId) ?? null,
    [roomTypes, form.roomTypeId],
  );
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const suggested = selectedRoomType ? selectedRoomType.basePriceCents * Math.max(1, nights) : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      // Auto-sugerir total cuando cambia room_type o fechas y user no tocó el total.
      if (k === "roomTypeId" || k === "checkIn" || k === "checkOut") {
        const rt = roomTypes.find((r) => r.id === next.roomTypeId);
        const n = Math.max(1, nightsBetween(next.checkIn, next.checkOut));
        if (rt) next.totalCents = rt.basePriceCents * n;
      }
      return next;
    });
  }

  function applySuggested() {
    setForm((prev) => ({ ...prev, totalCents: suggested }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.roomTypeId) {
      setError("Elige tipo de habitación.");
      return;
    }
    if (nights < 1) {
      setError("La salida debe ser después de la entrada.");
      return;
    }

    startTransition(async () => {
      const result = await createManualBookingAction({
        propertyId,
        roomTypeId: form.roomTypeId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        guestFullName: form.guestFullName.trim(),
        guestEmail: form.guestEmail.trim(),
        guestPhone: form.guestPhone.trim(),
        totalCents: form.totalCents,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "No pudimos crear la reserva.");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nueva reserva manual"
      className="fixed inset-0 z-[90] flex justify-end"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-[91] w-full max-w-[520px] h-full bg-paper border-l border-rule overflow-y-auto"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <header className="sticky top-0 z-[1] bg-paper border-b border-rule px-7 py-4 flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-0.5">
              Nueva reserva manual
            </span>
            <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 tracking-[-0.015em]">
              Registro directo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink-soft hover:bg-linen hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="px-7 py-6 space-y-5">
          <p className="text-[13px] text-ink-muted leading-[1.55] m-0">
            Para reservas que cierras por teléfono o walk-in. Se crea directo
            como <strong className="text-ink-soft font-medium">confirmada</strong>{" "}
            (sin esperar pago en línea).
          </p>

          <Field label="Tipo de habitación">
            <select
              value={form.roomTypeId}
              onChange={(e) => update("roomTypeId", e.target.value)}
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} — ${(rt.basePriceCents / 100).toLocaleString("es-CO")} / noche
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada">
              <input
                type="date"
                value={form.checkIn}
                onChange={(e) => update("checkIn", e.target.value)}
                className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              />
            </Field>
            <Field label="Salida">
              <input
                type="date"
                value={form.checkOut}
                onChange={(e) => update("checkOut", e.target.value)}
                className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              />
            </Field>
          </div>
          <p className="text-[12px] text-ink-muted -mt-3 mb-0">
            <span className="oldstyle">{nights}</span>{" "}
            {nights === 1 ? "noche" : "noches"}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Adultos">
              <input
                type="number"
                min={1}
                max={10}
                value={form.adults}
                onChange={(e) => update("adults", Number(e.target.value) || 1)}
                className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              />
            </Field>
            <Field label="Niños">
              <input
                type="number"
                min={0}
                max={10}
                value={form.children}
                onChange={(e) => update("children", Number(e.target.value) || 0)}
                className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
              />
            </Field>
          </div>

          <Field label="Nombre del huésped">
            <input
              type="text"
              value={form.guestFullName}
              onChange={(e) => update("guestFullName", e.target.value)}
              required
              placeholder="Ana López"
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.guestEmail}
              onChange={(e) => update("guestEmail", e.target.value)}
              required
              placeholder="ana@ejemplo.com"
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            />
          </Field>

          <Field label="Teléfono" helper="Formato E.164: +57…">
            <input
              type="tel"
              value={form.guestPhone}
              onChange={(e) => update("guestPhone", e.target.value)}
              required
              placeholder="+573001234567"
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)] font-mono tracking-[-0.01em]"
            />
          </Field>

          <Field
            label="Total (COP)"
            helper={
              suggested > 0 && suggested !== form.totalCents ? (
                <>
                  Sugerido:{" "}
                  <button
                    type="button"
                    onClick={applySuggested}
                    className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
                  >
                    ${(suggested / 100).toLocaleString("es-CO")}
                  </button>
                </>
              ) : null
            }
          >
            <div className="flex h-11 rounded-[10px] overflow-hidden bg-paper border border-rule-strong">
              <span className="inline-flex items-center px-3 border-r border-rule bg-cream text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
                COP $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={Math.round(form.totalCents / 100)}
                onChange={(e) => update("totalCents", Math.max(0, Number(e.target.value) * 100))}
                className="flex-1 border-0 outline-0 bg-transparent px-3 font-serif font-medium text-[16px] text-ink"
                style={{
                  fontVariantNumeric: "tabular-nums oldstyle-nums",
                  fontFeatureSettings: '"onum","tnum"',
                }}
              />
            </div>
          </Field>

          <Field label="Método de pago">
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                update("paymentMethod", e.target.value as FormState["paymentMethod"])
              }
              className="w-full h-11 bg-paper border border-rule-strong rounded-[10px] px-3.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)]"
            >
              <option value="manual_transfer">Transferencia manual</option>
              <option value="external">Externo (efectivo / TPV)</option>
              <option value="admin_override">Override admin</option>
            </select>
          </Field>

          <Field label="Notas internas (opcional)">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              placeholder="Vienen del aeropuerto. Solicitan room temprano."
              className="w-full bg-paper border border-rule-strong rounded-[10px] px-3.5 py-2.5 text-[14px] text-ink outline-0 focus:border-sage focus:shadow-[0_0_0_3px_var(--color-sage-tint)] leading-[1.5]"
            />
          </Field>

          {error && (
            <p role="alert" className="text-[13px] text-danger m-0">
              {error}
            </p>
          )}
        </div>

        <footer className="sticky bottom-0 bg-paper border-t border-rule px-7 py-3.5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors disabled:opacity-60"
          >
            {pending ? "Creando…" : "Crear reserva"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted mb-1.5">
        {label}
      </span>
      {children}
      {helper && (
        <span className="block text-[12px] text-ink-muted mt-1.5">{helper}</span>
      )}
    </label>
  );
}
