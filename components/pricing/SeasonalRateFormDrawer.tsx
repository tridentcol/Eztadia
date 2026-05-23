"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FieldShell,
  Input,
  NumberStepper,
} from "@/components/property-settings/primitives";
import { Drawer } from "@/components/shared/Drawer";
import {
  createSeasonalRateAction,
  updateSeasonalRateAction,
  deleteSeasonalRateAction,
} from "@/app/actions/pricing";

type RateForForm = {
  id?: string;
  name?: string | null;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  priceCents?: number;
  priority?: number;
};

export function SeasonalRateFormDrawer({
  open,
  onClose,
  roomTypeId,
  roomTypeName,
  basePriceCents,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  roomTypeId: string;
  roomTypeName: string;
  basePriceCents: number;
  initial?: RateForForm;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceCop, setPriceCop] = useState("");
  const [priority, setPriority] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(initial?.name ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setPriceCop(
      initial?.priceCents != null
        ? String(Math.round(initial.priceCents / 100))
        : String(Math.round(basePriceCents / 100)),
    );
    setPriority(initial?.priority ?? 0);
  }, [open, initial, basePriceCents]);

  const isEdit = Boolean(initial?.id);

  function submit() {
    setError(null);

    if (!startDate || !endDate) {
      setError("Fechas requeridas.");
      return;
    }
    if (startDate > endDate) {
      setError("La fecha de fin debe ser >= a la de inicio.");
      return;
    }
    const priceNum = Number(priceCop.replace(/[^\d]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Precio invalido.");
      return;
    }
    const priceCents = Math.round(priceNum * 100);

    startTransition(async () => {
      const res = isEdit
        ? await updateSeasonalRateAction({
            id: initial!.id,
            name: name.trim() || null,
            startDate,
            endDate,
            priceCents,
            priority,
          })
        : await createSeasonalRateAction({
            roomTypeId,
            name: name.trim() || null,
            startDate,
            endDate,
            priceCents,
            priority,
          });

      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!isEdit || !initial?.id) return;
    const ok = typeof window !== "undefined"
      ? window.confirm("¿Eliminar esta tarifa estacional? Esta acción no se puede deshacer.")
      : true;
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSeasonalRateAction({ id: initial.id });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar tarifa estacional" : "Nueva tarifa estacional"}
      subtitle={roomTypeName}
      footer={
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p className="text-xs text-danger m-0 flex-1">{error}</p>
          ) : (
            <span className="flex-1" />
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-10 px-4 rounded-[10px] text-[13.5px] font-medium text-ink-soft hover:bg-linen transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !startDate || !endDate || !priceCop.trim()}
            className="h-10 px-5 rounded-[10px] text-[13.5px] font-medium bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            {pending ? "Guardando…" : isEdit ? "Guardar" : "Crear tarifa"}
          </button>
        </div>
      }
    >
      <FieldShell label="Nombre — opcional" helper="Ej: Temporada alta, Diciembre, Semana santa.">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Temporada alta"
          maxLength={80}
        />
      </FieldShell>

      <div className="grid grid-cols-2 gap-4">
        <FieldShell label="Desde">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FieldShell>
        <FieldShell label="Hasta">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FieldShell>
      </div>

      <FieldShell
        label="Precio por noche (COP)"
        helper={`Base actual: $${Math.round(basePriceCents / 100).toLocaleString("es-CO")}. Sobrescribe durante el rango.`}
      >
        <Input
          inputMode="numeric"
          value={priceCop}
          onChange={(e) => setPriceCop(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="450000"
        />
      </FieldShell>

      <FieldShell label="Prioridad" helper="Si dos tarifas se solapan, gana la de mayor prioridad. 0 es por defecto.">
        <NumberStepper
          value={priority}
          onChange={setPriority}
          min={0}
          max={100}
          ariaLabel="Prioridad"
        />
      </FieldShell>

      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-danger hover:underline transition-colors disabled:opacity-50"
        >
          Eliminar esta tarifa
        </button>
      )}
    </Drawer>
  );
}
