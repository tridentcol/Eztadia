"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { AdminAuditLogRow } from "@/lib/db/queries/admin";
import {
  IconReceipt,
  IconDollar,
  IconDoor,
  IconHouse,
  IconUser,
  IconKey,
  IconBell,
  IconTag,
  IconClock,
  IconActivity,
} from "./icons";

const RESOURCE_META: Record<
  string,
  { Icon: (p: { className?: string }) => ReactNode; tone: string; label: string }
> = {
  booking:       { Icon: IconReceipt, tone: "bg-sage-tint text-sage", label: "Reserva" },
  booking_hold:  { Icon: IconClock,   tone: "bg-[rgba(184,146,62,0.14)] text-gold-dark", label: "Hold" },
  payment:       { Icon: IconDollar,  tone: "bg-[rgba(184,146,62,0.14)] text-gold-dark", label: "Pago" },
  room:          { Icon: IconDoor,    tone: "bg-linen text-ink-soft", label: "Habitación" },
  room_type:     { Icon: IconDoor,    tone: "bg-linen text-ink-soft", label: "Tipo" },
  seasonal_rate: { Icon: IconTag,     tone: "bg-linen text-ink-soft", label: "Tarifa" },
  property:      { Icon: IconHouse,   tone: "bg-cream text-ink-soft border border-rule", label: "Propiedad" },
  property_user: { Icon: IconUser,    tone: "bg-cream text-ink-soft border border-rule", label: "Miembro" },
  user:          { Icon: IconUser,    tone: "bg-cream text-ink-soft border border-rule", label: "User" },
  organization:  { Icon: IconHouse,   tone: "bg-cream text-ink-soft border border-rule", label: "Org" },
  auth:          { Icon: IconKey,     tone: "bg-[rgba(168,72,60,0.10)] text-danger", label: "Auth" },
};

function metaFor(resourceType: string) {
  return (
    RESOURCE_META[resourceType] ?? {
      Icon: IconActivity,
      tone: "bg-cream text-ink-soft border border-rule",
      label: resourceType,
    }
  );
}

const ACTOR_LABEL: Record<string, string> = {
  user: "User",
  system: "Sistema",
  webhook: "Webhook",
};

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "hace un momento";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `hace ${days} d`;
  return formatDateTime(iso);
}

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const mon = MONTHS[d.getUTCMonth()];
  const yr = String(d.getUTCFullYear()).slice(-2);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${yr} · ${hh}:${mm}`;
}

export function AuditTimeline({
  rows,
  selectedId,
  onRowClick,
}: {
  rows: AdminAuditLogRow[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-rule-strong rounded-[18px] bg-paper px-6 py-12 text-center">
        <p className="text-sm text-ink-muted m-0">
          Sin eventos que coincidan con los filtros.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {rows.map((r) => {
        const meta = metaFor(r.resourceType);
        const Icon = meta.Icon;
        const isSelected = selectedId === r.id;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onRowClick(r.id)}
              className={[
                "w-full text-left flex items-start gap-3.5 py-3.5 px-3 border-b border-rule transition-colors",
                isSelected ? "bg-linen" : "hover:bg-linen/60",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "w-8 h-8 shrink-0 rounded-lg inline-flex items-center justify-center mt-0.5",
                  meta.tone,
                ].join(" ")}
              >
                <Icon className="w-[15px] h-[15px]" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-mono text-[12.5px] text-ink tracking-tight">
                    {r.action}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                    · {meta.label}
                  </span>
                </div>
                <p className="text-[12.5px] text-ink-soft m-0 mt-0.5 truncate">
                  {r.actor
                    ? `${r.actor.fullName ?? "Sin nombre"} · ${r.actor.email}`
                    : ACTOR_LABEL[r.actorType] ?? r.actorType}
                  {r.property && (
                    <>
                      {" · "}
                      <span className="italic text-ink-soft">
                        {r.property.name}
                      </span>
                    </>
                  )}
                </p>
                {r.property && (
                  <Link
                    href={`/p/${r.property.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-sage hover:underline font-mono"
                  >
                    /p/{r.property.slug}
                  </Link>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span
                  className="text-[11.5px] text-ink-muted whitespace-nowrap"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  title={formatDateTime(r.createdAt)}
                >
                  {formatRelative(r.createdAt)}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
