"use client";

import { useMemo, useState } from "react";
import type { AdminUserRow, AdminUserDetail } from "@/lib/admin";
import { UsersTable } from "./UsersTable";
import { UsersCards } from "./UsersCards";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { IconSearch, IconChevronDown } from "../icons";

export function UsersPageClient({
  rows,
  details,
}: {
  rows: AdminUserRow[];
  details: Record<string, AdminUserDetail>;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const detail = selectedId ? details[selectedId] ?? null : null;

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap py-3.5 border-b border-rule mb-3.5">
        <div className="relative w-full sm:w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full h-[38px] pl-10 pr-3.5 bg-transparent border border-transparent rounded-xl text-sm text-ink placeholder:text-ink-muted hover:bg-linen focus:outline-none focus:bg-linen focus:border-rule-strong transition-colors"
          />
        </div>
        <span aria-hidden className="hidden sm:block w-px h-6 bg-rule" />
        {["Rol", "Estado", "País", "Fecha registro"].map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium bg-cream text-ink-soft border border-rule hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
          >
            {label}
            <IconChevronDown className="w-3 h-3 text-ink-muted" />
          </button>
        ))}
      </div>

      <UsersTable
        rows={filtered}
        selectedId={selectedId}
        onRowClick={(id) => setSelectedId(id)}
      />
      <UsersCards rows={filtered} onCardClick={(id) => setSelectedId(id)} />

      <UserDetailDrawer
        detail={detail}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
