"use client";

import type { AdminAuditLogRow } from "@/lib/db/queries/admin";
import { Drawer } from "@/components/shared/Drawer";

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
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${day} ${mon} ${yr} · ${hh}:${mm}:${ss} UTC`;
}

export function AuditDetailDrawer({
  log,
  open,
  onClose,
}: {
  log: AdminAuditLogRow | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={log ? log.action : "Detalle de evento"}
      subtitle={log ? log.resourceType : undefined}
    >
      {log ? <Inner log={log} /> : <Skeleton />}
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted m-0 mb-2.5">
        {title}
      </h3>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-t border-rule first:border-t-0">
      <span className="text-[12.5px] text-ink-muted">{label}</span>
      <span className="text-[13px] text-ink text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

function Inner({ log }: { log: AdminAuditLogRow }) {
  return (
    <>
      <Section title="Evento">
        <KV
          label="Acción"
          value={<span className="font-mono text-[12.5px]">{log.action}</span>}
        />
        <KV label="Recurso" value={log.resourceType} />
        {log.resourceId && (
          <KV
            label="ID recurso"
            value={
              <span className="font-mono text-[11.5px] text-ink-soft">
                {log.resourceId}
              </span>
            }
          />
        )}
        <KV label="Cuándo" value={formatDateTime(log.createdAt)} />
      </Section>

      <Section title="Actor">
        <KV label="Tipo" value={log.actorType} />
        {log.actor ? (
          <>
            <KV label="Nombre" value={log.actor.fullName ?? "—"} />
            <KV
              label="Email"
              value={
                <span className="font-mono text-[11.5px]">{log.actor.email}</span>
              }
            />
          </>
        ) : (
          <p className="text-[12.5px] text-ink-muted m-0 py-2">
            Sin actor humano (sistema/webhook/cron).
          </p>
        )}
      </Section>

      {log.property && (
        <Section title="Propiedad">
          <KV label="Nombre" value={log.property.name} />
          <KV
            label="Slug"
            value={
              <span className="font-mono text-[12px]">/p/{log.property.slug}</span>
            }
          />
        </Section>
      )}

      <Section title="Contexto técnico">
        <KV label="IP" value={log.ip ?? "—"} />
        <KV
          label="User-Agent"
          value={
            log.userAgent ? (
              <span className="font-mono text-[10.5px] text-ink-soft block">
                {log.userAgent}
              </span>
            ) : (
              "—"
            )
          }
        />
      </Section>

      <Section title="Diff">
        {log.diff ? (
          <pre
            className="m-0 p-3.5 rounded-[10px] bg-cream border border-rule text-[11.5px] text-ink-soft overflow-auto max-h-[40vh] font-mono whitespace-pre-wrap break-words"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {JSON.stringify(log.diff, null, 2)}
          </pre>
        ) : (
          <p className="text-[12.5px] text-ink-muted m-0">Sin diff registrado.</p>
        )}
      </Section>
    </>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-4 w-1/3 bg-linen rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-linen rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-linen rounded animate-pulse" />
    </div>
  );
}
