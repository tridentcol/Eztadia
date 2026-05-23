"use client";

import type { AdminPropertyDetail } from "@/lib/db/queries/admin";
import { Drawer } from "@/components/shared/Drawer";
import { formatCOP } from "@/lib/format";
import { BookingStatusPill } from "@/components/admin/bookings/pills";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(-2)}`;
}

function formatDateOnly(iso: string): string {
  // YYYY-MM-DD sin TZ shift
  const [y, m, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[m - 1]} ${String(y).slice(-2)}`;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  reception: "Recepción",
};

export function PropertyDetailDrawer({
  detail,
  open,
  onClose,
}: {
  detail: AdminPropertyDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={detail?.property.name ?? "Detalle de propiedad"}
      subtitle={detail ? `/p/${detail.property.slug}` : undefined}
    >
      {detail ? <Inner detail={detail} /> : <Skeleton />}
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
      <span className="text-[13px] text-ink text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

function Inner({ detail }: { detail: AdminPropertyDetail }) {
  const { property, organization, owner, members, recentBookings } = detail;

  return (
    <>
      <Section title="Propiedad">
        <KV label="Estado" value={property.is_active ? "Activa" : "Inactiva"} />
        <KV label="Ciudad" value={property.city ?? "—"} />
        <KV label="Dirección" value={property.address ?? "—"} />
        <KV label="Teléfono contacto" value={property.contact_phone ?? "—"} />
        <KV label="Creada" value={formatDate(property.created_at)} />
      </Section>

      <Section title="Organización">
        <KV label="Nombre" value={organization?.name ?? "—"} />
        <KV
          label="Owner"
          value={
            owner ? (
              <>
                {owner.fullName ?? "Sin nombre"}
                <span className="block text-[11.5px] text-ink-muted truncate">
                  {owner.email}
                </span>
              </>
            ) : (
              "—"
            )
          }
        />
      </Section>

      <Section title={`Miembros · ${members.length}`}>
        {members.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted m-0">Sin miembros.</p>
        ) : (
          <ul className="flex flex-col">
            {members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between gap-3 py-2.5 border-t border-rule first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-ink m-0 truncate">
                    {m.fullName ?? "Sin nombre"}
                  </p>
                  <p className="text-[11.5px] text-ink-muted m-0 truncate">
                    {m.email ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={[
                      "inline-flex items-center h-5 px-1.5 rounded-full text-[10.5px] font-medium",
                      m.role === "owner"
                        ? "bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)]"
                        : "bg-sage-tint text-sage",
                    ].join(" ")}
                  >
                    {ROLE_LABEL[m.role] ?? m.role}
                  </span>
                  {!m.acceptedAt && (
                    <span className="inline-flex items-center h-5 px-1.5 rounded-full text-[10.5px] font-medium bg-cream text-ink-muted border border-rule">
                      Pendiente
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Últimas reservas · ${recentBookings.length}`}>
        {recentBookings.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted m-0">Sin reservas.</p>
        ) : (
          <ul className="flex flex-col">
            {recentBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-3 py-3 border-t border-rule first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[12.5px] text-ink m-0 tracking-tight">
                    {b.code}
                  </p>
                  <p className="text-[12px] text-ink-muted m-0 truncate">
                    {b.guest_full_name}
                  </p>
                  <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
                    {formatDateOnly(b.check_in)} → {formatDateOnly(b.check_out)}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <BookingStatusPill status={b.status} size="xs" />
                  <p
                    className="text-[12.5px] text-ink m-0"
                    style={{
                      fontVariantNumeric: "oldstyle-nums tabular-nums",
                      fontFeatureSettings: '"onum","tnum"',
                    }}
                  >
                    {formatCOP(Math.round(b.total_cents / 100))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
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
