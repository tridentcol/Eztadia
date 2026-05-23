"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminEmailRow } from "@/lib/db/queries/admin";
import type { Database } from "@/lib/supabase/database.types";
import { IconSearch } from "@/components/admin/icons";

type Status = Database["public"]["Enums"]["EmailStatus"];

const STATUS_FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "sent", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "bounced", label: "Rebotado" },
  { value: "complained", label: "Spam reportado" },
];

const STATUS_TONE: Record<Status, string> = {
  sent: "bg-linen text-ink-soft border-rule",
  delivered: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
  bounced: "bg-[rgba(168,72,60,0.10)] text-danger border-[rgba(168,72,60,0.22)]",
  complained: "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]",
};

const STATUS_LABEL: Record<Status, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  bounced: "Rebotado",
  complained: "Spam",
};

export function EmailsPageClient({
  rows,
  templates,
}: {
  rows: AdminEmailRow[];
  templates: string[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [template, setTemplate] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (template !== "all" && r.template !== template) return false;
      if (!q) return true;
      return (
        r.subject.toLowerCase().includes(q) ||
        r.toEmail.toLowerCase().includes(q) ||
        r.template.toLowerCase().includes(q) ||
        (r.property?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, status, template]);

  return (
    <>
      <div className="flex items-start gap-3 flex-wrap py-3.5 border-b border-rule mb-6">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por asunto, destinatario, propiedad..."
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
        {templates.length > 0 && (
          <>
            <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
            <div className="relative">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                aria-label="Filtrar por plantilla"
                className="h-8 pl-3 pr-8 rounded-full text-[12.5px] font-medium bg-cream text-ink-soft border border-rule appearance-none cursor-pointer hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
              >
                <option value="all">Todas las plantillas</option>
                {templates.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
          Sin emails que coincidan con los filtros.
        </div>
      ) : (
        <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
          {filtered.map((e, i) => (
            <EmailRow key={e.id} email={e} divider={i > 0} />
          ))}
        </div>
      )}
    </>
  );
}

function EmailRow({
  email: e,
  divider,
}: {
  email: AdminEmailRow;
  divider: boolean;
}) {
  return (
    <article
      className={[
        "px-5 py-4 flex flex-wrap items-center gap-4",
        divider ? "border-t border-rule" : "",
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={[
              "text-[10.5px] font-medium px-2 py-0.5 rounded-full border shrink-0",
              STATUS_TONE[e.status],
            ].join(" ")}
          >
            {STATUS_LABEL[e.status]}
          </span>
          <span className="text-[11px] font-mono text-ink-muted">
            {e.template}
          </span>
          {e.property && (
            <Link
              href={`/p/${e.property.slug}`}
              className="text-[11px] text-sage hover:underline truncate max-w-[200px]"
            >
              {e.property.name}
            </Link>
          )}
        </div>
        <p className="text-[13.5px] font-medium text-ink m-0 mb-0.5 truncate">
          {e.subject}
        </p>
        <p className="text-[11.5px] text-ink-muted m-0 tabular-nums">
          → {e.toEmail}
          {" · "}
          <time dateTime={e.createdAt} title={new Date(e.createdAt).toISOString()}>
            {formatRelative(e.createdAt)}
          </time>
          {e.resendId && (
            <> · <span className="font-mono">{e.resendId.slice(0, 14)}…</span></>
          )}
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
