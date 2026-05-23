"use client";

import { useMemo, useState } from "react";
import { formatCOP } from "@/lib/format";
import { RoomTypeFormDrawer } from "./RoomTypeFormDrawer";
import { RoomFormDrawer } from "./RoomFormDrawer";
import {
  IconBed,
  IconEdit,
  IconPlus,
  IconUsers,
  IconRuler,
} from "./icons";

export type RoomTypeView = {
  id: string;
  nameEs: string;
  nameEn: string | null;
  descriptionEs: string | null;
  basePriceCents: number;
  capacityAdults: number;
  capacityChildren: number;
  sizeM2: number | null;
  bedConfiguration: string | null;
  amenities: string[];
  isActive: boolean;
  rooms: {
    id: string;
    number: string;
    floor: string | null;
    notes: string | null;
    isActive: boolean;
  }[];
};

type EditTypeState = { mode: "create" } | { mode: "edit"; rt: RoomTypeView } | null;
type EditRoomState =
  | { mode: "create"; roomTypeId?: string }
  | { mode: "edit"; room: RoomTypeView["rooms"][number]; roomTypeId: string }
  | null;

export function RoomsPageClient({
  propertyId,
  roomTypes,
}: {
  propertyId: string;
  roomTypes: RoomTypeView[];
}) {
  const [typeDrawer, setTypeDrawer] = useState<EditTypeState>(null);
  const [roomDrawer, setRoomDrawer] = useState<EditRoomState>(null);

  const activeTypesForSelect = useMemo(
    () =>
      roomTypes
        .filter((t) => t.isActive)
        .map((t) => ({ id: t.id, nameEs: t.nameEs })),
    [roomTypes],
  );

  const allTypesForSelect = useMemo(
    () => roomTypes.map((t) => ({ id: t.id, nameEs: t.nameEs })),
    [roomTypes],
  );

  const totalRooms = roomTypes.reduce(
    (acc, t) => acc + t.rooms.filter((r) => r.isActive).length,
    0,
  );
  const totalTypes = roomTypes.filter((t) => t.isActive).length;

  return (
    <div className="pb-12">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
            Propiedad
          </span>
          <h1 className="font-serif italic font-medium text-[32px] sm:text-[36px] text-ink m-0 tracking-[-0.02em] leading-[1.05]">
            Habitaciones
          </h1>
          <p className="text-sm text-ink-soft m-0 mt-2 max-w-[56ch] leading-[1.55]">
            Tipos de habitación con sus habitaciones físicas. Los tipos definen
            precio, capacidad y amenidades; las habitaciones son las unidades
            que asignas a una reserva.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          {roomTypes.length > 0 && (
            <button
              type="button"
              onClick={() => setRoomDrawer({ mode: "create" })}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-rule text-[13.5px] font-medium text-ink-soft hover:border-rule-strong hover:text-ink transition-colors"
            >
              <IconPlus className="w-3.5 h-3.5" />
              Habitación
            </button>
          )}
          <button
            type="button"
            onClick={() => setTypeDrawer({ mode: "create" })}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-sage text-cream text-[13.5px] font-medium hover:bg-sage-dark transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Nuevo tipo
          </button>
        </div>
      </header>

      {/* Summary strip */}
      {roomTypes.length > 0 && (
        <div className="mb-7 flex items-center gap-6 px-5 py-3.5 border border-rule rounded-[14px] bg-paper">
          <Stat label="Tipos activos" value={totalTypes} />
          <span aria-hidden className="h-6 w-px bg-rule" />
          <Stat label="Habitaciones activas" value={totalRooms} />
        </div>
      )}

      {/* Empty state */}
      {roomTypes.length === 0 ? (
        <EmptyState onCreate={() => setTypeDrawer({ mode: "create" })} />
      ) : (
        <div className="flex flex-col gap-5">
          {roomTypes.map((rt) => (
            <RoomTypeCard
              key={rt.id}
              rt={rt}
              onEditType={() => setTypeDrawer({ mode: "edit", rt })}
              onAddRoom={() =>
                setRoomDrawer({ mode: "create", roomTypeId: rt.id })
              }
              onEditRoom={(room) =>
                setRoomDrawer({ mode: "edit", room, roomTypeId: rt.id })
              }
            />
          ))}
        </div>
      )}

      <RoomTypeFormDrawer
        open={typeDrawer !== null}
        onClose={() => setTypeDrawer(null)}
        propertyId={propertyId}
        initial={typeDrawer?.mode === "edit" ? typeDrawer.rt : undefined}
      />

      <RoomFormDrawer
        open={roomDrawer !== null}
        onClose={() => setRoomDrawer(null)}
        propertyId={propertyId}
        roomTypeId={
          roomDrawer?.mode === "create" ? roomDrawer.roomTypeId : undefined
        }
        roomTypes={
          roomDrawer?.mode === "edit" ? allTypesForSelect : activeTypesForSelect
        }
        initial={
          roomDrawer?.mode === "edit"
            ? {
                id: roomDrawer.room.id,
                number: roomDrawer.room.number,
                floor: roomDrawer.room.floor,
                notes: roomDrawer.room.notes,
                isActive: roomDrawer.room.isActive,
                roomTypeId: roomDrawer.roomTypeId,
              }
            : undefined
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      <span
        className="font-serif text-[22px] text-ink leading-none mt-1"
        style={{
          fontVariantNumeric: "oldstyle-nums tabular-nums",
          fontFeatureSettings: '"onum","tnum"',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RoomTypeCard({
  rt,
  onEditType,
  onAddRoom,
  onEditRoom,
}: {
  rt: RoomTypeView;
  onEditType: () => void;
  onAddRoom: () => void;
  onEditRoom: (room: RoomTypeView["rooms"][number]) => void;
}) {
  const activeRooms = rt.rooms.filter((r) => r.isActive);
  const archivedRooms = rt.rooms.filter((r) => !r.isActive);
  const priceCop = Math.round(rt.basePriceCents / 100);

  return (
    <article
      className={[
        "border rounded-[18px] bg-paper transition-colors",
        rt.isActive ? "border-rule" : "border-rule bg-cream",
      ].join(" ")}
    >
      <header className="px-5 sm:px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 tracking-[-0.01em]">
              {rt.nameEs}
            </h2>
            {!rt.isActive && (
              <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium bg-linen text-ink-muted">
                Archivado
              </span>
            )}
          </div>
          {rt.descriptionEs && (
            <p className="text-[13.5px] text-ink-soft m-0 leading-[1.55] max-w-[64ch]">
              {rt.descriptionEs}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconUsers className="w-3.5 h-3.5" />
              {rt.capacityAdults} adulto{rt.capacityAdults === 1 ? "" : "s"}
              {rt.capacityChildren > 0 && ` + ${rt.capacityChildren} niño${rt.capacityChildren === 1 ? "" : "s"}`}
            </span>
            {rt.bedConfiguration && (
              <span className="inline-flex items-center gap-1.5">
                <IconBed className="w-3.5 h-3.5" />
                {rt.bedConfiguration}
              </span>
            )}
            {rt.sizeM2 != null && (
              <span className="inline-flex items-center gap-1.5">
                <IconRuler className="w-3.5 h-3.5" />
                {rt.sizeM2} m²
              </span>
            )}
          </div>
          {rt.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rt.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center h-6 px-2 rounded-full text-[11.5px] font-medium bg-cream text-ink-soft border border-rule"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end gap-3 sm:gap-1.5">
          <span
            className="font-serif text-[28px] text-ink leading-none"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {formatCOP(priceCop)}
          </span>
          <span className="text-[11.5px] text-ink-muted">por noche</span>
        </div>
      </header>

      <div className="border-t border-rule px-5 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-medium tracking-[0.08em] uppercase text-ink-muted m-0">
            Habitaciones · {activeRooms.length}
            {archivedRooms.length > 0 && (
              <span className="text-ink-muted/70 font-normal">
                {" "}
                + {archivedRooms.length} archivadas
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddRoom}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium text-sage hover:bg-sage-tint transition-colors"
            >
              <IconPlus className="w-3 h-3" />
              Habitación
            </button>
            <button
              type="button"
              onClick={onEditType}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium text-ink-soft hover:bg-linen hover:text-ink transition-colors"
            >
              <IconEdit className="w-3 h-3" />
              Editar tipo
            </button>
          </div>
        </div>

        {rt.rooms.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted m-0 py-2">
            Sin habitaciones físicas para este tipo todavía.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {rt.rooms.map((room) => (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => onEditRoom(room)}
                  className={[
                    "group inline-flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-[10px] border transition-colors",
                    room.isActive
                      ? "border-rule bg-paper hover:border-rule-strong hover:bg-cream"
                      : "border-rule bg-cream text-ink-muted",
                  ].join(" ")}
                  title={room.notes ?? undefined}
                >
                  <span className="font-mono text-[12.5px] text-ink tracking-tight">
                    #{room.number}
                  </span>
                  {room.floor && (
                    <span className="text-[11.5px] text-ink-muted">
                      Piso {room.floor}
                    </span>
                  )}
                  {!room.isActive && (
                    <span className="text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
                      Archivada
                    </span>
                  )}
                  <IconEdit className="w-3 h-3 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-dashed border-rule-strong rounded-[20px] bg-paper px-6 py-12 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-sage-tint inline-flex items-center justify-center text-sage">
        <IconBed className="w-5 h-5" />
      </div>
      <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-2 tracking-[-0.01em]">
        Empieza por un tipo de habitación
      </h2>
      <p className="text-sm text-ink-soft m-0 max-w-[44ch] mx-auto leading-[1.55]">
        Define el primer tipo (precio, capacidad, amenidades) y luego agrega
        las habitaciones físicas que pertenecen a él.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-sage text-cream text-[13.5px] font-medium hover:bg-sage-dark transition-colors"
      >
        <IconPlus className="w-3.5 h-3.5" />
        Crear primer tipo
      </button>
    </div>
  );
}
