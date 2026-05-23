"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type { BookingRow } from "@/lib/bookings";
import { formatCOP } from "@/lib/format";
import { StatusPill, OriginLabel } from "./pills";
import { IconDotsThree, IconSortAsc, IconSortBoth, IconSortDesc } from "./icons";

const helper = createColumnHelper<BookingRow>();

export function BookingsTable({
  rows,
  selectedCode,
  onRowClick,
}: {
  rows: BookingRow[];
  selectedCode: string | null;
  onRowClick: (code: string) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      helper.accessor("code", {
        header: "Código",
        cell: (info) => (
          <span className="font-mono text-[12.5px] tracking-[-0.02em] text-ink-soft">
            {info.getValue()}
          </span>
        ),
        enableSorting: true,
      }),
      helper.accessor((r) => r.guest.name, {
        id: "guest",
        header: "Huésped",
        sortingFn: "text",
        cell: (info) => {
          const r = info.row.original;
          return (
            <span className="inline-flex items-center gap-3 whitespace-nowrap">
              {r.guest.photo ? (
                <span className="w-7 h-7 rounded-full overflow-hidden bg-sage-tint inline-block">
                  <Image
                    src={r.guest.photo}
                    alt=""
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="w-7 h-7 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-[11px] font-medium"
                >
                  {r.guest.initials}
                </span>
              )}
              <span className="font-serif italic font-medium text-[15px] text-ink tracking-[-0.005em]">
                {r.guest.name}
              </span>
            </span>
          );
        },
      }),
      helper.accessor("roomNumber", {
        header: "Habitación",
        cell: (info) => {
          const r = info.row.original;
          return (
            <span className="whitespace-nowrap">
              <span className="font-serif font-medium text-[16px] text-ink mr-1.5 oldstyle">
                {r.roomNumber}
              </span>
              <span className="text-[12px] text-ink-muted">· {r.roomType}</span>
            </span>
          );
        },
      }),
      helper.accessor((r) => r.checkIn.iso, {
        id: "checkIn",
        header: "Check-in",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const r = info.row.original;
          return (
            <span className="block leading-tight">
              <span className="block text-sm text-ink oldstyle">{r.checkIn.dayLabelShort}</span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                {r.checkIn.dayLabelLong}
              </span>
            </span>
          );
        },
      }),
      helper.accessor((r) => r.checkOut.iso, {
        id: "checkOut",
        header: "Check-out",
        cell: (info) => {
          const r = info.row.original;
          return (
            <span className="block leading-tight">
              <span className="block text-sm text-ink oldstyle">{r.checkOut.dayLabelShort}</span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                {r.checkOut.dayLabelLong}
              </span>
            </span>
          );
        },
      }),
      helper.accessor("totalCOP", {
        header: "Total",
        cell: (info) => (
          <span
            className="font-serif font-medium text-[17px] text-ink whitespace-nowrap"
            style={{ fontVariantNumeric: "tabular-nums oldstyle-nums", fontFeatureSettings: '"onum","tnum"' }}
          >
            {formatCOP(info.getValue())}
          </span>
        ),
      }),
      helper.accessor("status", {
        header: "Estado",
        cell: (info) => <StatusPill status={info.getValue()} />,
      }),
      helper.accessor("origin", {
        header: "Origen",
        cell: (info) => <OriginLabel origin={info.getValue()} />,
      }),
      helper.display({
        id: "actions",
        header: () => null,
        cell: ({ row }) => <RowActions code={row.original.code} />,
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

  const totalRows = rows.length;
  const ps = table.getState().pagination.pageSize;
  const pi = table.getState().pagination.pageIndex;
  const from = totalRows === 0 ? 0 : pi * ps + 1;
  const to = Math.min(totalRows, (pi + 1) * ps);

  return (
    <div className="hidden md:block">
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      className={[
                        "text-left px-3.5 py-3.5 border-b border-rule bg-cream",
                        "text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted whitespace-nowrap",
                        sortable ? "cursor-pointer select-none group" : "",
                        header.id === "actions" ? "w-11" : "",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && (
                          <span
                            className={`inline-flex transition-opacity ${
                              sortDir ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {sortDir === "asc" ? (
                              <IconSortAsc className="w-[9px] h-[9px]" />
                            ) : sortDir === "desc" ? (
                              <IconSortDesc className="w-[9px] h-[9px]" />
                            ) : (
                              <IconSortBoth className="w-[9px] h-[9px]" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => {
              const isSelected = selectedCode === row.original.code;
              const zebra = i % 2 === 1 && !isSelected;
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original.code)}
                  className={[
                    "transition-colors cursor-pointer",
                    isSelected
                      ? "[&>td]:bg-linen"
                      : zebra
                        ? "[&>td]:bg-paper hover:[&>td]:bg-linen"
                        : "hover:[&>td]:bg-linen",
                  ].join(" ")}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={[
                        "px-3.5 py-4 border-b border-rule align-middle text-sm text-ink",
                        isSelected && idx === 0 ? "shadow-[inset_3px_0_0_var(--color-sage)]" : "",
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

      {/* Pagination */}
      <div className="flex justify-between items-center pt-5 px-1 text-[13px] text-ink-muted">
        <span>
          Mostrando{" "}
          <span className="text-ink-soft font-medium oldstyle">
            {from}–{to}
          </span>{" "}
          de <span className="text-ink-soft font-medium oldstyle">32</span> reservas
        </span>
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium text-ink-soft hover:bg-linen hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
            Anterior
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium text-ink-soft hover:bg-linen hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function RowActions({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Acciones para reserva ${code}`}
        aria-expanded={open}
        className="w-[30px] h-[30px] rounded-lg text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors"
      >
        <IconDotsThree className="w-4 h-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[20] cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-[34px] z-[25] bg-paper border border-rule rounded-xl p-1.5 w-[200px]"
            style={{ boxShadow: "var(--shadow-pop, var(--shadow-soft))" }}
          >
            {[
              "Ver detalle",
              "Enviar WhatsApp",
              "Modificar fechas",
            ].map((label) => (
              <button
                key={label}
                role="menuitem"
                type="button"
                onClick={() => setOpen(false)}
                className="w-full text-left text-[13px] text-ink px-2.5 py-2 rounded-lg hover:bg-linen transition-colors"
              >
                {label}
              </button>
            ))}
            <div aria-hidden className="h-px bg-rule mx-1 my-1" />
            <button
              role="menuitem"
              type="button"
              onClick={() => setOpen(false)}
              className="w-full text-left text-[13px] text-clay px-2.5 py-2 rounded-lg hover:bg-[rgba(199,111,76,0.08)] transition-colors"
            >
              Cancelar reserva
            </button>
          </div>
        </>
      )}
    </span>
  );
}
