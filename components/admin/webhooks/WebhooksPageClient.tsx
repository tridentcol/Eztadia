"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminWebhookLogRow } from "@/lib/db/queries/admin";
import { IconSearch } from "@/components/admin/icons";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "processed", label: "Procesado" },
  { value: "received", label: "Recibido" },
  { value: "failed", label: "Falló" },
  { value: "rejected_signature", label: "Firma inválida" },
  { value: "rejected_idempotency", label: "Idempotencia" },
  { value: "rejected_other", label: "Otro rechazo" },
];

const STATUS_TONE: Record<string, string> = {
  processed: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
  received: "bg-linen text-ink-soft border-rule",
  failed: "bg-[rgba(168,72,60,0.10)] text-danger border-[rgba(168,72,60,0.22)]",
  rejected_signature:
    "bg-[rgba(168,72,60,0.10)] text-danger border-[rgba(168,72,60,0.22)]",
  rejected_idempotency:
    "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
  rejected_other:
    "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
};

const STATUS_LABEL: Record<string, string> = {
  processed: "Procesado",
  received: "Recibido",
  failed: "Falló",
  rejected_signature: "Firma",
  rejected_idempotency: "Idemp.",
  rejected_other: "Rechazo",
};

export function WebhooksPageClient({
  rows,
  providers,
}: {
  rows: AdminWebhookLogRow[];
  providers: string[];
}) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (provider !== "all" && r.provider !== provider) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.provider.toLowerCase().includes(q) ||
        (r.eventType?.toLowerCase().includes(q) ?? false) ||
        (r.requestId?.toLowerCase().includes(q) ?? false) ||
        (r.error?.toLowerCase().includes(q) ?? false) ||
        (r.property?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, provider, status]);

  const selected = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId],
  );

  return (
    <>
      <div className="flex items-start gap-3 flex-wrap py-3.5 border-b border-rule mb-6">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por evento, request ID, error..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        <div
          role="group"
          aria-label="Filtrar por estado"
          className="inline-flex items-center gap-1 flex-wrap"
        >
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatus(f.value)}
                className={[
                  "h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors border",
                  active
                    ? "bg-sage-tint text-sage border-sage-tint"
                    : "bg-cream text-ink-soft border-rule hover:bg-linen hover:text-ink hover:border-rule-strong",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {providers.length > 0 && (
          <>
            <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                aria-label="Filtrar por provider"
                className="h-8 pl-3 pr-8 rounded-full text-[12.5px] font-medium bg-cream text-ink-soft border border-rule appearance-none cursor-pointer hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
              >
                <option value="all">Todos los providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-muted pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-paper border border-rule rounded-2xl p-10 text-center text-[13px] text-ink-muted">
          Sin webhooks que coincidan con los filtros.
        </div>
      ) : (
        <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
          {filtered.map((r, i) => (
            <WebhookRow
              key={r.id}
              row={r}
              divider={i > 0}
              onClick={() => setSelectedId(r.id)}
            />
          ))}
        </div>
      )}

      <WebhookDetailDrawer
        row={selected}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

function WebhookRow({
  row,
  divider,
  onClick,
}: {
  row: AdminWebhookLogRow;
  divider: boolean;
  onClick: () => void;
}) {
  const tone = STATUS_TONE[row.status] ?? "bg-linen text-ink-soft border-rule";
  const label = STATUS_LABEL[row.status] ?? row.status;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-linen transition-colors",
        divider ? "border-t border-rule" : "",
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={[
              "text-[10.5px] font-medium px-2 py-0.5 rounded-full border shrink-0",
              tone,
            ].join(" ")}
          >
            {label}
          </span>
          <span className="text-[12px] font-mono text-ink font-medium">
            {row.provider}
          </span>
          {row.eventType && (
            <span className="text-[11px] font-mono text-ink-muted">
              {row.eventType}
            </span>
          )}
          {row.signatureValid === false && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(168,72,60,0.10)] text-danger">
              HMAC ✗
            </span>
          )}
          {row.property && (
            <Link
              href={`/p/${row.property.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-sage hover:underline truncate max-w-[200px]"
            >
              {row.property.name}
            </Link>
          )}
        </div>
        <p className="text-[12px] text-ink-muted m-0 truncate font-mono">
          {row.requestId ?? <em>sin id</em>}
        </p>
        {row.error && (
          <p className="text-[11.5px] text-danger m-0 mt-1 font-mono truncate">
            {row.error}
          </p>
        )}
        <p className="text-[11px] text-ink-muted m-0 mt-1 tabular-nums">
          {row.httpStatus && <>HTTP {row.httpStatus} · </>}
          {row.durationMs !== null && <>{row.durationMs} ms · </>}
          <time
            dateTime={row.createdAt}
            title={new Date(row.createdAt).toISOString()}
          >
            {formatRelative(row.createdAt)}
          </time>
        </p>
      </div>
    </button>
  );
}

function WebhookDetailDrawer({
  row,
  open,
  onClose,
}: {
  row: AdminWebhookLogRow | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-[80] transition-opacity duration-300 ease-organic cursor-default ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.18)" }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del webhook"
        className={[
          "fixed z-[90] bg-paper flex flex-col ease-organic transition-transform duration-[320ms]",
          "left-0 right-0 bottom-0 max-h-[92vh] rounded-t-[28px]",
          "md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[560px] md:max-h-none md:rounded-none md:border-l md:border-rule",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        ].join(" ")}
        style={{ boxShadow: open ? "var(--shadow-drawer, var(--shadow-pop))" : "none" }}
      >
        {row && (
          <>
            <header className="shrink-0 flex items-start justify-between gap-3 px-5 md:px-6 py-4 border-b border-rule">
              <div className="min-w-0 flex-1">
                <h2 className="font-serif italic font-medium text-[18px] text-ink m-0 truncate">
                  {row.provider} · {row.eventType ?? "(sin tipo)"}
                </h2>
                <p className="text-[11.5px] text-ink-muted m-0 mt-1 font-mono truncate">
                  {row.requestId ?? "(sin request id)"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-ink-soft hover:bg-linen transition-colors"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
              <Meta row={row} />

              {row.payload !== null && row.payload !== undefined && (
                <JsonBlock label="Payload" value={row.payload} />
              )}
              {row.response !== null && row.response !== undefined && (
                <JsonBlock label="Response" value={row.response} />
              )}
              {row.error && (
                <section className="mt-5">
                  <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted m-0 mb-2">
                    Error
                  </p>
                  <pre className="bg-[rgba(168,72,60,0.06)] border border-[rgba(168,72,60,0.18)] rounded-[10px] px-3 py-2.5 font-mono text-[12px] text-danger whitespace-pre-wrap break-words m-0">
                    {row.error}
                  </pre>
                </section>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Meta({ row }: { row: AdminWebhookLogRow }) {
  const items: { label: string; value: string }[] = [
    { label: "Status", value: STATUS_LABEL[row.status] ?? row.status },
    { label: "HTTP", value: row.httpStatus !== null ? String(row.httpStatus) : "—" },
    { label: "Latencia", value: row.durationMs !== null ? `${row.durationMs} ms` : "—" },
    {
      label: "HMAC",
      value:
        row.signatureValid === true
          ? "Válida"
          : row.signatureValid === false
            ? "Inválida"
            : "N/A",
    },
    { label: "IP", value: row.ip ?? "—" },
    {
      label: "User agent",
      value: row.userAgent ? row.userAgent.slice(0, 60) : "—",
    },
    {
      label: "Fecha",
      value: new Date(row.createdAt).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
    },
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 mb-5">
      {items.map((it) => (
        <div key={it.label} className="contents">
          <dt className="text-[11.5px] uppercase tracking-[0.06em] text-ink-muted">
            {it.label}
          </dt>
          <dd className="text-[12.5px] text-ink m-0 break-words font-mono">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <section className="mt-5">
      <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted m-0 mb-2">
        {label}
      </p>
      <pre className="bg-linen rounded-[10px] px-3 py-2.5 font-mono text-[11.5px] text-ink-soft whitespace-pre-wrap break-words m-0 max-h-[40vh] overflow-y-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
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
