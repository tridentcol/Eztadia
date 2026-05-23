"use client";

import { useMemo, useState } from "react";
import type { BookingRow, BookingDetail } from "@/lib/bookings";
import { BookingsToolbar, type FilterKey } from "./BookingsToolbar";
import { BookingsTable } from "./BookingsTable";
import { BookingsCards } from "./BookingsCards";
import { BookingDetailDrawer } from "./BookingDetailDrawer";

export function BookingsPageClient({
  rows,
  details,
}: {
  rows: BookingRow[];
  details: Record<string, BookingDetail>;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.guest.name.toLowerCase().includes(q) ||
        r.roomNumber.includes(q) ||
        r.roomType.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const handleRowClick = (code: string) => {
    setSelectedCode(code);
  };

  const closeDrawer = () => setSelectedCode(null);
  const detail = selectedCode ? details[selectedCode] ?? null : null;

  return (
    <>
      <BookingsToolbar
        query={query}
        onQueryChange={setQuery}
        activeFilters={filters}
        onClearFilter={(k) => {
          setFilters((p) => {
            const next = { ...p };
            delete next[k];
            return next;
          });
        }}
        onClearAll={() => setFilters({})}
      />

      <BookingsTable rows={filteredRows} selectedCode={selectedCode} onRowClick={handleRowClick} />
      <BookingsCards rows={filteredRows} onCardClick={handleRowClick} />

      <BookingDetailDrawer detail={detail} open={selectedCode !== null} onClose={closeDrawer} />
    </>
  );
}
