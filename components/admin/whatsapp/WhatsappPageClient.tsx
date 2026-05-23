"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminWhatsappRow } from "@/lib/db/queries/admin";
import type { Database } from "@/lib/supabase/database.types";
import { IconSearch } from "@/components/admin/icons";

type Status = Database["public"]["Enums"]["WhatsappMessageStatus"];
type Direction = Database["public"]["Enums"]["MessageDirection"];

const STATUS_FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "sent", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "read", label: "Leído" },
  { value: "failed", label: "Falló" },
];

const DIRECTION_FILTERS: { value: Direction | "all"; label: string }[] = [
  { value: "all", label: "Ambas" },
  { value: "outbound", label: "Salientes" },
  { value: "inbound", label: "Entrantes" },
];

const STATUS_TONE: Record<Status, string> = {
  sent: "bg-linen text-ink-soft border-rule",
  delivered: "bg-linen text-ink-soft border-rule",
  read: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
  failed: "bg-[rgba(168,72,60,0.10)] text-danger border-[rgba(168,72,60,0.22)]",
};

const STATUS_LABEL: Record<Status, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
};

export function WhatsappPageClient({
  rows,
}: {
  rows: AdminWhatsappRow[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [direction, setDirection] = useState<Direction | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (direction !== "all" && r.direction !== direction) return false;
      if (!q) return true;
      return (
        (r.body?.toLowerCase().includes(q) ?? false) ||
        r.fromPhone.toLowerCase().includes(q) ||
        r.toPhone.toLowerCase().includes(q) ||
        (r.templateName?.toLowerCase().includes(q) ?? false) ||
        (r.property?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, status, direction]);

  return (
    <>
      <div className="flex items-start gap-3 flex-wrap py-3.5 border-b border-rule mb-6">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por mensaje, teléfono, propiedad..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        <FilterGroup
          label="Filtrar por dirección"
          items={DIRECTION_FILTERS}
          value={direction}
          onChange={setDirection}
        />
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        <FilterGroup
          label="Filtrar por estado"
          items={STATUS_FILTERS}
          value={status}
          onChange={setStatus}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-paper border border-rule rounded-2xl p-10 text-center text-[13px] text-ink-muted">
          Sin mensajes que coincidan con los filtros.
        </div>
      ) : (
        <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
          {filtered.map((m, i) => (
            <MessageRow key={m.id} message={m} divider={i > 0} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1 flex-wrap">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={[
              "h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors border",
              active
                ? "bg-sage-tint text-sage border-sage-tint"
                : "bg-cream text-ink-soft border-rule hover:bg-linen hover:text-ink hover:border-rule-strong",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function MessageRow({
  message: m,
  divider,
}: {
  message: AdminWhatsappRow;
  divider: boolean;
}) {
  const isOutbound = m.direction === "outbound";
  return (
    <article
      className={[
        "px-5 py-4 flex items-start gap-4",
        divider ? "border-t border-rule" : "",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
          isOutbound ? "bg-sage" : "bg-gold",
        ].join(" ")}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-[11px] uppercase tracking-[0.06em] text-ink-muted font-medium">
            {isOutbound ? "Saliente" : "Entrante"}
          </span>
          <span
            className={[
              "text-[10.5px] font-medium px-2 py-0.5 rounded-full border",
              STATUS_TONE[m.status],
            ].join(" ")}
          >
            {STATUS_LABEL[m.status]}
          </span>
          {m.templateName && (
            <span className="text-[11px] font-mono text-ink-muted">
              {m.templateName}
            </span>
          )}
          {m.property && (
            <Link
              href={`/p/${m.property.slug}`}
              className="text-[11px] text-sage hover:underline truncate max-w-[200px]"
            >
              {m.property.name}
            </Link>
          )}
        </div>
        <p className="text-[13.5px] text-ink m-0 leading-snug">
          {m.body ?? <span className="text-ink-muted italic">Sin cuerpo</span>}
        </p>
        {m.error && (
          <p className="text-[11.5px] text-danger m-0 mt-1.5 font-mono">
            Error: {m.error}
          </p>
        )}
        <p className="text-[11px] text-ink-muted m-0 mt-1.5 tabular-nums">
          {isOutbound ? `→ ${m.toPhone}` : `← ${m.fromPhone}`}
          {" · "}
          <time dateTime={m.createdAt} title={new Date(m.createdAt).toISOString()}>
            {formatRelative(m.createdAt)}
          </time>
          {m.metaMessageId && <> · <span className="font-mono">{m.metaMessageId.slice(0, 12)}…</span></>}
        </p>
      </div>
    </article>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffMin < 60 * 24) return `hace ${Math.round(diffMin / 60)} h`;
  const days = Math.round(diffMin / (60 * 24));
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
