"use client";

import type { AdminPropertyRow } from "@/lib/db/queries/admin";

export function PropertiesCards({
  rows,
  onCardClick,
}: {
  rows: AdminPropertyRow[];
  onCardClick: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="md:hidden text-sm text-ink-muted text-center py-10">
        No hay propiedades que coincidan.
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif italic font-medium text-[16px] text-ink m-0 tracking-[-0.01em] truncate">
                  {r.name}
                </p>
                <p className="text-xs text-ink-muted m-0 font-mono mt-0.5 truncate">
                  /p/{r.slug}
                </p>
              </div>
              {r.isActive ? (
                <span className="inline-flex items-center h-5 px-1.5 rounded-full text-[10.5px] font-medium bg-sage-tint text-sage shrink-0">
                  Activa
                </span>
              ) : (
                <span className="inline-flex items-center h-5 px-1.5 rounded-full text-[10.5px] font-medium bg-linen text-ink-muted shrink-0">
                  Inactiva
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[12.5px] text-ink-soft">
              {r.city && <span>{r.city}</span>}
              <span className="tabular-nums">{r.roomsCount} hab.</span>
              <span className="tabular-nums">{r.bookingsCount} reservas</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
