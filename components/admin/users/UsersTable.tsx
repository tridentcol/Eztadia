"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type { AdminUserRow } from "@/lib/admin";
import { RolePill, StatusPill } from "./UserPills";
import { IconDotsThree } from "../icons";

const helper = createColumnHelper<AdminUserRow>();

export function UsersTable({
  rows,
  selectedId,
  onRowClick,
}: {
  rows: AdminUserRow[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      helper.accessor((r) => r.fullName, {
        id: "user",
        header: "Usuario",
        cell: (info) => {
          const r = info.row.original;
          const isSuper = r.role === "super_admin";
          return (
            <span className="inline-flex items-center gap-3">
              <span
                aria-hidden
                className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-[12px] font-medium ${
                  isSuper
                    ? "bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)]"
                    : "bg-sage-tint text-sage"
                }`}
              >
                {r.initials}
              </span>
              <span>
                <p className="font-serif italic font-medium text-[15px] text-ink m-0 tracking-[-0.01em]">
                  {r.fullName}
                </p>
                <p className="text-xs text-ink-muted m-0">{r.email}</p>
              </span>
            </span>
          );
        },
      }),
      helper.accessor("role", {
        header: "Rol",
        cell: (info) => <RolePill role={info.getValue()} />,
      }),
      helper.accessor((r) => r.propertiesLabel, {
        id: "properties",
        header: "Propiedades",
        cell: (info) => {
          const v = info.getValue();
          const muted = v.startsWith("—");
          return (
            <span className={`text-[13px] ${muted ? "text-ink-muted" : "text-ink-soft"}`}>
              {v}
            </span>
          );
        },
      }),
      helper.accessor((r) => r.lastSeenLabel, {
        id: "lastSeen",
        header: "Última conexión",
        cell: (info) => {
          const v = info.getValue();
          const muted = v === "nunca";
          return (
            <span
              className={`text-[13px] ${muted ? "text-ink-muted" : "text-ink-soft"}`}
              style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
            >
              {v}
            </span>
          );
        },
      }),
      helper.accessor("status", {
        header: "Estado",
        cell: (info) => <StatusPill status={info.getValue()} />,
      }),
      helper.display({
        id: "actions",
        header: () => null,
        cell: () => (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label="Acciones"
            className="w-[30px] h-[30px] rounded-lg text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors"
          >
            <IconDotsThree className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={[
                    "text-left px-3.5 py-3.5 border-b border-rule bg-cream",
                    "text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted whitespace-nowrap",
                    header.id === "actions" ? "w-11" : "",
                  ].join(" ")}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isSelected = selectedId === row.original.id;
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original.id)}
                className={[
                  "transition-colors cursor-pointer",
                  isSelected ? "[&>td]:bg-linen" : "hover:[&>td]:bg-linen",
                ].join(" ")}
              >
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={[
                      "px-3.5 py-4 border-b border-rule align-middle text-sm text-ink",
                      isSelected && idx === 0
                        ? "shadow-[inset_3px_0_0_var(--color-sage)]"
                        : "",
                    ].join(" ")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
