"use client";

import { useMemo, useState } from "react";
import type {
  AdminBookingRow,
  AdminBookingDetail,
} from "@/lib/db/queries/admin";
import type { Database } from "@/lib/supabase/database.types";
import { IconSearch } from "../icons";
import { BookingsTable } from "./BookingsTable";
import { BookingsCards } from "./BookingsCards";
import { AdminBookingDetailDrawer } from "./BookingDetailDrawer";

type BookingStatus = Database["public"]["Enums"]["BookingStatus"];

const STATUS_FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending_payment", label: "Pago pendiente" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "completed", label: "Completadas" },
  { value: "no_show", label: "No show" },
];

export function BookingsPageClient({
  rows,
  details,
}: {
  rows: AdminBookingRow[];
  details: Record<string, AdminBookingDetail>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.guestFullName.toLowerCase().includes(q) ||
        (r.guestEmail?.toLowerCase().includes(q) ?? false) ||
        (r.property?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, statusFilter]);

  const detail = selectedId ? details[selectedId] ?? null : null;

  return (
    <>
      <div className="flex items-start gap-3 flex-wrap py-3.5 border-b border-rule mb-3.5">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, huésped, email o propiedad..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        <div
          role="group"
          aria-label="Filtrar por estado"
          className="inline-flex items-center gap-1 flex-wrap"
        >
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={[
                  "h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors border",
                  active
                    ? "bg-sage-tint text-sage border-sage-tint"
                    : "bg-cream text-ink-soft border-rule hover:bg-linen hover:text-ink hover:border-rule-strong",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <BookingsTable
        rows={filtered}
        selectedId={selectedId}
        onRowClick={(id) => setSelectedId(id)}
      />
      <BookingsCards rows={filtered} onCardClick={(id) => setSelectedId(id)} />

      <AdminBookingDetailDrawer
        detail={detail}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
