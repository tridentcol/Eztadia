"use client";

import type { AdminBookingRow } from "@/lib/db/queries/admin";
import { formatCOP } from "@/lib/format";
import { BookingStatusPill } from "./pills";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${String(y).slice(-2)}`;
}

export function BookingsCards({
  rows,
  onCardClick,
}: {
  rows: AdminBookingRow[];
  onCardClick: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="md:hidden text-sm text-ink-muted text-center py-10">
        No hay reservas que coincidan.
      </p>
    );
  }

  return (
    <ul className="md:hidden flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onCardClick(r.id)}
            className="w-full text-left border border-rule rounded-[14px] bg-paper px-4 py-4 hover:bg-cream transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-[12.5px] text-ink m-0 tracking-tight">
                  {r.code}
                </p>
                <p className="font-serif italic font-medium text-[14px] text-ink m-0 mt-0.5 tracking-[-0.01em] truncate">
                  {r.property?.name ?? "—"}
                </p>
              </div>
              <BookingStatusPill status={r.status} size="xs" />
            </div>
            <p className="text-[13px] text-ink m-0 truncate">{r.guestFullName}</p>
            <div className="mt-2 flex items-baseline justify-between gap-2 text-[12.5px] text-ink-soft">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatDateOnly(r.checkIn)} → {formatDateOnly(r.checkOut)}
              </span>
              <span
                className="font-serif text-ink"
                style={{
                  fontVariantNumeric: "oldstyle-nums tabular-nums",
                  fontFeatureSettings: '"onum","tnum"',
                }}
              >
                {formatCOP(Math.round(r.totalCents / 100))}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
