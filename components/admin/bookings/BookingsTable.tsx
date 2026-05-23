"use client";

import type { AdminBookingRow } from "@/lib/db/queries/admin";
import { formatCOP } from "@/lib/format";
import { BookingStatusPill, paymentMethodLabel } from "./pills";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${String(y).slice(-2)}`;
}

export function BookingsTable({
  rows,
  selectedId,
  onRowClick,
}: {
  rows: AdminBookingRow[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {[
              { id: "code", label: "Código" },
              { id: "property", label: "Propiedad" },
              { id: "guest", label: "Huésped" },
              { id: "dates", label: "Estancia" },
              { id: "method", label: "Método" },
              { id: "total", label: "Total", align: "right" as const },
              { id: "status", label: "Estado" },
            ].map((h) => (
              <th
                key={h.id}
                scope="col"
                className={[
                  "px-3.5 py-3.5 border-b border-rule bg-cream",
                  "text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted whitespace-nowrap",
                  h.align === "right" ? "text-right" : "text-left",
                ].join(" ")}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isSelected = selectedId === r.id;
            return (
              <tr
                key={r.id}
                onClick={() => onRowClick(r.id)}
                className={[
                  "transition-colors cursor-pointer",
                  isSelected ? "[&>td]:bg-linen" : "hover:[&>td]:bg-linen",
                ].join(" ")}
              >
                <td
                  className={[
                    "px-3.5 py-4 border-b border-rule align-middle text-sm",
                    isSelected
                      ? "shadow-[inset_3px_0_0_var(--color-sage)]"
                      : "",
                  ].join(" ")}
                >
                  <p className="font-mono text-[12.5px] text-ink m-0 tracking-tight">
                    {r.code}
                  </p>
                  <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
                    {r.nights}{" "}
                    {r.nights === 1 ? "noche" : "noches"}
                  </p>
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-sm">
                  <p className="font-serif italic font-medium text-[14px] text-ink m-0 tracking-[-0.01em]">
                    {r.property?.name ?? "—"}
                  </p>
                  <p className="text-[11.5px] text-ink-muted m-0">
                    {r.roomType?.nameEs ?? "—"}
                    {r.room && (
                      <span className="font-mono ml-1 text-ink-soft">
                        · #{r.room.number}
                      </span>
                    )}
                  </p>
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-sm">
                  <p className="text-ink m-0 truncate max-w-[180px]">
                    {r.guestFullName}
                  </p>
                  <p className="text-[11.5px] text-ink-muted m-0 truncate max-w-[180px]">
                    {r.guestEmail ?? "—"}
                  </p>
                </td>
                <td
                  className="px-3.5 py-4 border-b border-rule align-middle text-[13px] text-ink-soft whitespace-nowrap"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDateOnly(r.checkIn)} → {formatDateOnly(r.checkOut)}
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-[12.5px] text-ink-soft">
                  {paymentMethodLabel(r.paymentMethod)}
                </td>
                <td
                  className="px-3.5 py-4 border-b border-rule align-middle text-sm text-right"
                  style={{
                    fontVariantNumeric: "oldstyle-nums tabular-nums",
                    fontFeatureSettings: '"onum","tnum"',
                  }}
                >
                  {formatCOP(Math.round(r.totalCents / 100))}
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle">
                  <BookingStatusPill status={r.status} />
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3.5 py-12 text-center text-sm text-ink-muted border-b border-rule"
              >
                No hay reservas que coincidan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
