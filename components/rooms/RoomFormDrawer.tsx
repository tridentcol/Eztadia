"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FieldShell,
  Input,
  Select,
  Textarea,
} from "@/components/property-settings/primitives";
import { createRoomAction, updateRoomAction } from "@/app/actions/rooms";
import { Drawer } from "@/components/shared/Drawer";

type RoomForForm = {
  id?: string;
  number?: string;
  floor?: string | null;
  notes?: string | null;
  isActive?: boolean;
};

export function RoomFormDrawer({
  open,
  onClose,
  propertyId,
  roomTypeId,
  roomTypes,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  /** Si viene preset, no se puede cambiar (caso "agregar a este tipo"). */
  roomTypeId?: string;
  /** Para edit/create libre, lista de tipos activos. */
  roomTypes: { id: string; nameEs: string }[];
  initial?: RoomForForm & { roomTypeId?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedTypeId(
      initial?.roomTypeId ?? roomTypeId ?? roomTypes[0]?.id ?? "",
    );
    setNumber(initial?.number ?? "");
    setFloor(initial?.floor ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial, roomTypeId, roomTypes]);

  const isEdit = Boolean(initial?.id);
  const typeLocked = Boolean(roomTypeId) && !isEdit;

  function submit() {
    setError(null);
    if (!selectedTypeId) {
      setError("Selecciona un tipo de habitacion.");
      return;
    }
    if (!number.trim()) {
      setError("Numero requerido.");
      return;
    }
    startTransition(async () => {
      const payload = {
        number: number.trim(),
        floor: floor.trim() || null,
        notes: notes.trim() || null,
      };
      const res = isEdit
        ? await updateRoomAction({
            id: initial!.id,
            roomTypeId: selectedTypeId,
            ...payload,
          })
        : await createRoomAction({
            propertyId,
            roomTypeId: selectedTypeId,
            ...payload,
          });

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
      title={isEdit ? `Editar habitación ${initial?.number ?? ""}` : "Nueva habitación"}
      subtitle="Habitación física asociada a un tipo"
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
            disabled={pending || !number.trim() || !selectedTypeId}
            className="h-10 px-5 rounded-[10px] text-[13.5px] font-medium bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear habitación"}
          </button>
        </div>
      }
    >
      <FieldShell label="Tipo de habitación">
        {typeLocked ? (
          <Input
            value={
              roomTypes.find((t) => t.id === selectedTypeId)?.nameEs ?? "—"
            }
            disabled
          />
        ) : (
          <Select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            {roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEs}
              </option>
            ))}
          </Select>
        )}
      </FieldShell>

      <FieldShell label="Número" helper="Identificador único dentro de la propiedad (ej: 101, 2A, Suite 5).">
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="101"
          maxLength={20}
        />
      </FieldShell>

      <FieldShell label="Piso — opcional">
        <Input
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          placeholder="2"
          maxLength={20}
        />
      </FieldShell>

      <FieldShell label="Notas internas — opcional" helper="Solo visible para el equipo (mantenimiento, peculiaridades, etc).">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cerca del ascensor. Pintura programada para junio."
          maxLength={500}
        />
      </FieldShell>

      {isEdit && (
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const res = await updateRoomAction({
                id: initial!.id,
                isActive: !initial?.isActive,
              });
              if (!res.ok) setError(res.error);
              else {
                router.refresh();
                onClose();
              }
            });
          }}
          disabled={pending}
          className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors disabled:opacity-50"
        >
          {initial?.isActive ? "Archivar esta habitación" : "Reactivar esta habitación"}
        </button>
      )}
    </Drawer>
  );
}
