"use client";

import Link from "next/link";
import type { AdminBookingDetail } from "@/lib/db/queries/admin";
import { Drawer } from "@/components/shared/Drawer";
import { formatCOP } from "@/lib/format";
import { BookingStatusPill, PaymentStatusPill, paymentMethodLabel } from "./pills";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${String(y).slice(-2)}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = d.getUTCDate();
  const mon = MONTHS[d.getUTCMonth()];
  const yr = String(d.getUTCFullYear()).slice(-2);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${yr} · ${hh}:${mm}`;
}

export function AdminBookingDetailDrawer({
  detail,
  open,
  onClose,
}: {
  detail: AdminBookingDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={detail ? `Reserva ${detail.booking.code}` : "Detalle de reserva"}
      subtitle={detail?.property?.name ?? undefined}
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
      <span className="text-[13px] text-ink text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function Inner({ detail }: { detail: AdminBookingDetail }) {
  const { booking, property, roomType, room, payment, auditLogs } = detail;

  return (
    <>
      <Section title="Estado">
        <div className="flex items-center gap-2 flex-wrap">
          <BookingStatusPill status={booking.status} />
          {payment && <PaymentStatusPill status={payment.status} />}
        </div>
      </Section>

      <Section title="Estancia">
        <KV
          label="Check-in"
          value={
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatDateOnly(booking.check_in)}
            </span>
          }
        />
        <KV
          label="Check-out"
          value={
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatDateOnly(booking.check_out)}
            </span>
          }
        />
        <KV label="Noches" value={booking.nights} />
        <KV label="Adultos" value={booking.adults} />
        {booking.children > 0 && (
          <KV label="Niños" value={booking.children} />
        )}
      </Section>

      <Section title="Huésped">
        <KV label="Nombre" value={booking.guest_full_name} />
        <KV label="Email" value={booking.guest_email ?? "—"} />
        <KV label="Teléfono" value={booking.guest_phone ?? "—"} />
        {booking.guest_document_number && (
          <KV
            label="Documento"
            value={`${booking.guest_document_type ?? "DOC"} · ${booking.guest_document_number}`}
          />
        )}
      </Section>

      <Section title="Habitación">
        <KV label="Tipo" value={roomType?.nameEs ?? "—"} />
        <KV
          label="Habitación asignada"
          value={
            room ? (
              <>
                #{room.number}
                {room.floor && (
                  <span className="text-ink-muted ml-1">(Piso {room.floor})</span>
                )}
              </>
            ) : (
              "Sin asignar"
            )
          }
        />
      </Section>

      <Section title="Pago">
        <KV label="Método" value={paymentMethodLabel(booking.payment_method)} />
        {payment ? (
          <>
            <KV label="Estado" value={<PaymentStatusPill status={payment.status} />} />
            <KV
              label="Monto"
              value={
                <span
                  className="font-serif"
                  style={{
                    fontVariantNumeric: "oldstyle-nums tabular-nums",
                    fontFeatureSettings: '"onum","tnum"',
                  }}
                >
                  {formatCOP(Math.round(payment.amountCents / 100))}
                </span>
              }
            />
            <KV label="Creado" value={formatDateTime(payment.createdAt)} />
            {payment.confirmedAt && (
              <KV label="Confirmado" value={formatDateTime(payment.confirmedAt)} />
            )}
          </>
        ) : (
          <p className="text-[12.5px] text-ink-muted m-0 py-2">
            Sin registro de pago.
          </p>
        )}
        <KV
          label="Total reserva"
          value={
            <span
              className="font-serif"
              style={{
                fontVariantNumeric: "oldstyle-nums tabular-nums",
                fontFeatureSettings: '"onum","tnum"',
              }}
            >
              {formatCOP(Math.round(booking.total_cents / 100))}
            </span>
          }
        />
      </Section>

      <Section title="Propiedad">
        <KV label="Nombre" value={property?.name ?? "—"} />
        <KV
          label="Slug"
          value={
            property ? (
              <Link
                href={`/p/${property.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sage hover:underline font-mono text-[12px]"
              >
                /p/{property.slug}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <KV label="Ciudad" value={property?.city ?? "—"} />
      </Section>

      <Section title={`Actividad · ${auditLogs.length}`}>
        {auditLogs.length === 0 ? (
          <p className="text-[12.5px] text-ink-muted m-0 py-2">
            Sin eventos registrados.
          </p>
        ) : (
          <ul className="flex flex-col">
            {auditLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-start justify-between gap-3 py-2 border-t border-rule first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] text-ink m-0 font-mono tracking-tight truncate">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-ink-muted m-0 mt-0.5 uppercase tracking-[0.05em]">
                    {log.actor_type}
                  </p>
                </div>
                <span
                  className="text-[11.5px] text-ink-muted whitespace-nowrap shrink-0"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDateTime(log.created_at)}
                </span>
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
