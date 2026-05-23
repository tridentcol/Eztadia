"use client";

import type { BookingRow } from "@/lib/bookings";
import { formatCOP } from "@/lib/format";
import { StatusPill, OriginLabel } from "./pills";

export function BookingsCards({
  rows,
  onCardClick,
}: {
  rows: BookingRow[];
  onCardClick: (code: string) => void;
}) {
  return (
    <div className="md:hidden flex flex-col gap-2.5">
      {rows.map((r) => (
        <button
          key={r.code}
          type="button"
          onClick={() => onCardClick(r.code)}
          className="text-left bg-paper border border-rule rounded-2xl p-4 hover:border-rule-strong transition-colors"
        >
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="font-mono text-[12px] text-ink-soft tracking-[-0.02em]">{r.code}</span>
            <StatusPill status={r.status} />
          </div>
          <p className="font-serif italic font-medium text-[18px] text-ink m-0 mb-1 tracking-[-0.015em]">
            {r.guest.name}
          </p>
          <p className="text-[13px] text-ink-soft m-0">
            <span className="text-ink font-medium oldstyle">{r.roomNumber}</span>
            <span className="text-ink-muted"> · {r.roomType} · </span>
            <span className="oldstyle">
              {r.checkIn.dayLabelShort} → {r.checkOut.dayLabelShort}
            </span>
          </p>
          <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-rule">
            <span
              className="font-serif font-medium text-[20px] text-ink"
              style={{ fontVariantNumeric: "tabular-nums oldstyle-nums", fontFeatureSettings: '"onum","tnum"' }}
            >
              {formatCOP(r.totalCOP)}
            </span>
            <OriginLabel origin={r.origin} />
          </div>
        </button>
      ))}
    </div>
  );
}
