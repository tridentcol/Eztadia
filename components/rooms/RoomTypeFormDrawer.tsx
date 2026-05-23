"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FieldShell,
  Input,
  Textarea,
  NumberStepper,
} from "@/components/property-settings/primitives";
import {
  createRoomTypeAction,
  updateRoomTypeAction,
} from "@/app/actions/rooms";
import { Drawer } from "@/components/shared/Drawer";

type RoomTypeForForm = {
  id?: string;
  nameEs?: string;
  nameEn?: string | null;
  descriptionEs?: string | null;
  basePriceCents?: number;
  capacityAdults?: number;
  capacityChildren?: number;
  sizeM2?: number | null;
  bedConfiguration?: string | null;
  amenities?: string[];
  isActive?: boolean;
};

const AMENITY_PRESETS = [
  "Wifi",
  "Aire acondicionado",
  "TV",
  "Cafetera",
  "Refrigerador",
  "Caja fuerte",
  "Balcón",
  "Vista al mar",
  "Vista al jardín",
  "Jacuzzi",
  "Mini-bar",
  "Servicio a la habitación",
];

const BED_OPTIONS = [
  "1 cama king",
  "1 cama queen",
  "2 camas dobles",
  "2 camas individuales",
  "1 doble + 1 individual",
  "Litera",
];

export function RoomTypeFormDrawer({
  open,
  onClose,
  propertyId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  initial?: RoomTypeForForm;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [priceCop, setPriceCop] = useState("");
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(0);
  const [sizeM2, setSizeM2] = useState("");
  const [bedConfiguration, setBedConfiguration] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset / hydrate when drawer abre
  useEffect(() => {
    if (!open) return;
    setError(null);
    setNameEs(initial?.nameEs ?? "");
    setNameEn(initial?.nameEn ?? "");
    setDescriptionEs(initial?.descriptionEs ?? "");
    setPriceCop(
      initial?.basePriceCents != null
        ? String(Math.round(initial.basePriceCents / 100))
        : "",
    );
    setCapacityAdults(initial?.capacityAdults ?? 2);
    setCapacityChildren(initial?.capacityChildren ?? 0);
    setSizeM2(initial?.sizeM2 != null ? String(initial.sizeM2) : "");
    setBedConfiguration(initial?.bedConfiguration ?? "");
    setAmenities(initial?.amenities ?? []);
  }, [open, initial]);

  const isEdit = Boolean(initial?.id);

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  function submit() {
    setError(null);

    const priceNum = Number(priceCop.replace(/[^\d]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Precio invalido.");
      return;
    }
    const basePriceCents = Math.round(priceNum * 100);
    const sizeNum = sizeM2.trim() ? Number(sizeM2) : null;

    startTransition(async () => {
      const payload = {
        nameEs: nameEs.trim(),
        nameEn: nameEn.trim() || null,
        descriptionEs: descriptionEs.trim() || null,
        basePriceCents,
        capacityAdults,
        capacityChildren,
        sizeM2: sizeNum,
        bedConfiguration: bedConfiguration.trim() || null,
        amenities,
      };

      const res = isEdit
        ? await updateRoomTypeAction({ id: initial!.id, ...payload })
        : await createRoomTypeAction({ propertyId, ...payload });

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
      title={isEdit ? "Editar tipo de habitación" : "Nuevo tipo de habitación"}
      subtitle="Define un tipo y luego agrega habitaciones físicas para él"
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
            disabled={pending || !nameEs.trim() || !priceCop.trim()}
            className="h-10 px-5 rounded-[10px] text-[13.5px] font-medium bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear tipo"}
          </button>
        </div>
      }
    >
      <FieldShell label="Nombre (español)">
        <Input
          value={nameEs}
          onChange={(e) => setNameEs(e.target.value)}
          placeholder="Suite Marina"
          maxLength={80}
        />
      </FieldShell>

      <FieldShell label="Nombre (inglés) — opcional">
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Marina Suite"
          maxLength={80}
        />
      </FieldShell>

      <FieldShell label="Descripción" helper="Máximo 2000 caracteres. Se muestra en la página pública.">
        <Textarea
          value={descriptionEs}
          onChange={(e) => setDescriptionEs(e.target.value)}
          placeholder="Suite con vista al mar, balcón privado y baño con jacuzzi…"
          maxLength={2000}
        />
      </FieldShell>

      <FieldShell label="Precio base por noche (COP)" helper="Sin puntos ni decimales. Ej: 375000">
        <Input
          inputMode="numeric"
          value={priceCop}
          onChange={(e) => setPriceCop(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="375000"
        />
      </FieldShell>

      <div className="grid grid-cols-2 gap-4 mb-1">
        <FieldShell label="Adultos">
          <NumberStepper
            value={capacityAdults}
            onChange={setCapacityAdults}
            min={1}
            max={20}
            ariaLabel="Capacidad adultos"
          />
        </FieldShell>
        <FieldShell label="Niños">
          <NumberStepper
            value={capacityChildren}
            onChange={setCapacityChildren}
            min={0}
            max={20}
            ariaLabel="Capacidad ninos"
          />
        </FieldShell>
      </div>

      <FieldShell label="Tamaño (m²) — opcional">
        <Input
          inputMode="numeric"
          value={sizeM2}
          onChange={(e) => setSizeM2(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="32"
        />
      </FieldShell>

      <FieldShell label="Configuración de camas">
        <div className="flex flex-wrap gap-2">
          {BED_OPTIONS.map((opt) => {
            const active = bedConfiguration === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setBedConfiguration((prev) => (prev === opt ? "" : opt))
                }
                className={[
                  "h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors",
                  active
                    ? "border-sage bg-sage-tint text-sage"
                    : "border-rule bg-paper text-ink-soft hover:border-rule-strong",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </FieldShell>

      <FieldShell label="Amenidades">
        <div className="flex flex-wrap gap-2">
          {AMENITY_PRESETS.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={[
                  "h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors",
                  active
                    ? "border-sage bg-sage-tint text-sage"
                    : "border-rule bg-paper text-ink-soft hover:border-rule-strong",
                ].join(" ")}
              >
                {a}
              </button>
            );
          })}
        </div>
      </FieldShell>

      {isEdit && (
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const res = await updateRoomTypeAction({
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
          {initial?.isActive ? "Archivar este tipo" : "Reactivar este tipo"}
        </button>
      )}
    </Drawer>
  );
}
