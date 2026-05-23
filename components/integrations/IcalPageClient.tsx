"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/shared/Drawer";
import {
  FieldShell,
  Input,
  Select,
  ToggleSwitch,
} from "@/components/property-settings/primitives";
import {
  createIcalFeedAction,
  updateIcalFeedAction,
  deleteIcalFeedAction,
  regenerateIcalSecretAction,
} from "@/app/actions/ical";

export type IcalFeedView = {
  id: string;
  name: string;
  url: string;
  direction: "inbound" | "outbound";
  isActive: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  roomId: string | null;
  room: { id: string; number: string } | null;
};

export type RoomOption = { id: string; number: string };

type DrawerState =
  | { mode: "create"; direction: "inbound" | "outbound" }
  | { mode: "edit"; feed: IcalFeedView }
  | null;

export function IcalPageClient({
  propertyId,
  feeds,
  rooms,
  outgoingUrl,
}: {
  propertyId: string;
  feeds: IcalFeedView[];
  rooms: RoomOption[];
  outgoingUrl: string | null;
}) {
  const router = useRouter();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [busy, startBusy] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);

  const inbound = feeds.filter((f) => f.direction === "inbound");
  const outbound = feeds.filter((f) => f.direction === "outbound");

  function handleDelete(feed: IcalFeedView) {
    if (!confirm(`¿Eliminar el feed "${feed.name}"?`)) return;
    setBanner(null);
    startBusy(async () => {
      const res = await deleteIcalFeedAction({ feedId: feed.id });
      if (!res.ok) {
        setBanner(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleToggleActive(feed: IcalFeedView) {
    setBanner(null);
    startBusy(async () => {
      const res = await updateIcalFeedAction({
        feedId: feed.id,
        isActive: !feed.isActive,
      });
      if (!res.ok) {
        setBanner(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      {banner && (
        <div
          role="alert"
          className="mb-6 flex gap-2.5 px-4 py-3 rounded-[10px] text-sm leading-[1.45] text-ink bg-[rgba(168,72,60,0.08)] border-l-[3px] border-danger"
        >
          {banner}
        </div>
      )}

      <ExportSection propertyId={propertyId} outgoingUrl={outgoingUrl} />

      <FeedsSection
        title="Feeds entrantes"
        subtitle="URLs externas que importas (Booking, Airbnb, otras)."
        emptyHint="Agrega un feed para sincronizar reservas externas con tu calendario."
        feeds={inbound}
        onAdd={() => setDrawer({ mode: "create", direction: "inbound" })}
        onEdit={(f) => setDrawer({ mode: "edit", feed: f })}
        onDelete={handleDelete}
        onToggle={handleToggleActive}
        busy={busy}
      />

      {outbound.length > 0 && (
        <FeedsSection
          title="Feeds salientes adicionales"
          subtitle="URLs externas a las que publicas tu disponibilidad."
          feeds={outbound}
          onAdd={() => setDrawer({ mode: "create", direction: "outbound" })}
          onEdit={(f) => setDrawer({ mode: "edit", feed: f })}
          onDelete={handleDelete}
          onToggle={handleToggleActive}
          busy={busy}
        />
      )}

      {drawer && (
        <FeedDrawer
          propertyId={propertyId}
          rooms={rooms}
          state={drawer}
          onClose={() => setDrawer(null)}
          onSaved={() => {
            setDrawer(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function ExportSection({
  propertyId,
  outgoingUrl,
}: {
  propertyId: string;
  outgoingUrl: string | null;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [rotating, startRotate] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);

  async function copy() {
    if (!outgoingUrl) return;
    try {
      await navigator.clipboard.writeText(outgoingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  function rotate() {
    const ok = outgoingUrl
      ? confirm(
          "Regenerar el secret invalida la URL actual. Tendrás que volver a pegarla en Booking/Airbnb/etc. ¿Continuar?",
        )
      : true;
    if (!ok) return;
    setBanner(null);
    startRotate(async () => {
      const res = await regenerateIcalSecretAction({ propertyId });
      if (!res.ok) {
        setBanner(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mb-10">
      <header className="mb-4">
        <h2 className="font-serif italic font-medium text-[20px] text-ink m-0">
          Tu feed iCal saliente
        </h2>
        <p className="text-[12.5px] text-ink-muted m-0 mt-1 max-w-[60ch] leading-relaxed">
          Pega esta URL en Booking, Airbnb u otra plataforma para que vean tus
          reservas confirmadas y bloqueen las fechas automáticamente.
        </p>
      </header>

      <div className="bg-paper border border-rule rounded-2xl p-5">
        {outgoingUrl ? (
          <>
            <div className="flex items-center gap-2.5 bg-linen rounded-[10px] px-3 py-2.5 mb-3">
              <code className="flex-1 min-w-0 font-mono text-[12px] text-ink-soft tracking-[-0.01em] truncate">
                {outgoingUrl}
              </code>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-paper border border-rule text-ink-soft text-xs font-medium hover:bg-cream hover:text-ink transition-colors shrink-0"
              >
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <button
              type="button"
              onClick={rotate}
              disabled={rotating}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-transparent text-ink-soft border border-rule text-[13px] font-medium hover:bg-linen hover:text-ink disabled:opacity-60 transition-colors"
            >
              {rotating ? "Regenerando…" : "Regenerar secret"}
            </button>
          </>
        ) : (
          <div className="text-center py-3">
            <p className="text-[13px] text-ink-soft m-0 mb-3">
              Aún no has generado tu feed saliente.
            </p>
            <button
              type="button"
              onClick={rotate}
              disabled={rotating}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition disabled:opacity-60"
            >
              {rotating ? "Generando…" : "Generar feed iCal"}
            </button>
          </div>
        )}
        {banner && (
          <p className="mt-3 text-[12px] text-danger m-0">{banner}</p>
        )}
      </div>
    </section>
  );
}

function FeedsSection({
  title,
  subtitle,
  emptyHint,
  feeds,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  busy,
}: {
  title: string;
  subtitle: string;
  emptyHint?: string;
  feeds: IcalFeedView[];
  onAdd: () => void;
  onEdit: (f: IcalFeedView) => void;
  onDelete: (f: IcalFeedView) => void;
  onToggle: (f: IcalFeedView) => void;
  busy: boolean;
}) {
  return (
    <section className="mb-10">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="font-serif italic font-medium text-[20px] text-ink m-0">
            {title}
          </h2>
          <p className="text-[12.5px] text-ink-muted m-0 mt-1 max-w-[60ch] leading-relaxed">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-sage text-cream text-[13px] font-medium hover:bg-[#4F6759] transition-colors shrink-0"
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Agregar feed
        </button>
      </header>

      {feeds.length === 0 ? (
        <div className="bg-paper border border-rule rounded-2xl p-6 text-[13px] text-ink-muted">
          {emptyHint ?? "Sin feeds."}
        </div>
      ) : (
        <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
          {feeds.map((f, i) => (
            <FeedRow
              key={f.id}
              feed={f}
              divider={i > 0}
              onEdit={() => onEdit(f)}
              onDelete={() => onDelete(f)}
              onToggle={() => onToggle(f)}
              busy={busy}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedRow({
  feed,
  divider,
  onEdit,
  onDelete,
  onToggle,
  busy,
}: {
  feed: IcalFeedView;
  divider: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  busy: boolean;
}) {
  return (
    <div
      className={[
        "px-5 py-4 flex flex-wrap items-center gap-4",
        divider ? "border-t border-rule" : "",
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-serif italic font-medium text-[14.5px] text-ink m-0 truncate">
            {feed.name}
          </p>
          {feed.room && (
            <span className="text-[10.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full bg-linen text-ink-soft font-medium shrink-0">
              Hab {feed.room.number}
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-ink-muted m-0 truncate font-mono">
          {feed.url}
        </p>
        <p className="text-[11px] text-ink-muted m-0 mt-1">
          {feed.lastSyncError ? (
            <span className="text-danger">Error: {feed.lastSyncError}</span>
          ) : feed.lastSyncedAt ? (
            <>Última sincronización: {formatRelative(feed.lastSyncedAt)}</>
          ) : (
            <>Sin sincronizar todavía</>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ToggleSwitch
          checked={feed.isActive}
          onChange={onToggle}
          ariaLabel={`Activar ${feed.name}`}
        />
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="h-8 px-3 rounded-[8px] text-ink-soft text-[12.5px] font-medium hover:bg-linen hover:text-ink disabled:opacity-60 transition-colors"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="h-8 px-3 rounded-[8px] text-danger text-[12.5px] font-medium hover:bg-[rgba(168,72,60,0.08)] disabled:opacity-60 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function FeedDrawer({
  propertyId,
  rooms,
  state,
  onClose,
  onSaved,
}: {
  propertyId: string;
  rooms: RoomOption[];
  state: NonNullable<DrawerState>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = state.mode === "edit";
  const initial = editing ? state.feed : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [direction, setDirection] = useState<"inbound" | "outbound">(
    initial ? initial.direction : state.mode === "create" ? state.direction : "inbound",
  );
  const [roomId, setRoomId] = useState<string | "">(initial?.roomId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        url: url.trim(),
        direction,
        roomId: roomId === "" ? null : roomId,
        isActive,
      };
      const res = editing
        ? await updateIcalFeedAction({ feedId: initial!.id, ...payload })
        : await createIcalFeedAction({ propertyId, ...payload });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={editing ? "Editar feed" : "Nuevo feed iCal"}
      subtitle={
        direction === "inbound"
          ? "Importa reservas desde una URL externa"
          : "Publica disponibilidad a una URL externa"
      }
      footer={
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink disabled:opacity-60 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-10 px-[18px] rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition disabled:opacity-60"
          >
            {saving ? "Guardando…" : editing ? "Guardar" : "Crear feed"}
          </button>
        </div>
      }
    >
      <FieldShell label="Nombre del feed">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Ej. "Booking · Suite 101"'
          autoFocus
        />
      </FieldShell>

      <FieldShell
        label="URL"
        helper="Pega la URL iCal que te dio la plataforma externa."
      >
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://admin.booking.com/hotel/.../calendar.ics"
          className="font-mono text-[13px]"
        />
      </FieldShell>

      <FieldShell label="Dirección">
        <Select
          value={direction}
          onChange={(e) =>
            setDirection(e.target.value as "inbound" | "outbound")
          }
        >
          <option value="inbound">Entrante — importar desde la URL</option>
          <option value="outbound">Saliente — publicar a la URL</option>
        </Select>
      </FieldShell>

      <FieldShell
        label="Habitación (opcional)"
        helper="Vincula este feed a una habitación específica, o déjalo a nivel propiedad."
      >
        <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Toda la propiedad</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              Habitación {r.number}
            </option>
          ))}
        </Select>
      </FieldShell>

      <div className="flex items-center justify-between gap-4 bg-paper border border-rule rounded-[14px] px-4 py-3.5 mb-5">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink m-0">
            {isActive ? "Activo" : "Pausado"}
          </p>
          <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
            {isActive ? "Sincroniza en cada ciclo cron." : "No sincroniza hasta reactivar."}
          </p>
        </div>
        <ToggleSwitch
          checked={isActive}
          onChange={setIsActive}
          ariaLabel="Activar feed"
        />
      </div>

      {err && (
        <p className="text-[12.5px] text-danger m-0">{err}</p>
      )}
    </Drawer>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffMin < 60 * 24) return `hace ${Math.round(diffMin / 60)} h`;
  const days = Math.round(diffMin / (60 * 24));
  return `hace ${days} d`;
}
