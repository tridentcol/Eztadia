"use client";

import type { AdminPropertyRow } from "@/lib/db/queries/admin";

function formatDate(iso: string): string {
  // YYYY-MM-DDTHH:mm... → "d mmm yy" en español, sin TZ shift confuso
  const d = new Date(iso);
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(-2)}`;
}

export function PropertiesTable({
  rows,
  selectedId,
  onRowClick,
}: {
  rows: AdminPropertyRow[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {[
              { id: "name", label: "Propiedad" },
              { id: "org", label: "Organización" },
              { id: "city", label: "Ciudad" },
              { id: "rooms", label: "Hab.", align: "right" as const },
              { id: "bookings", label: "Reservas", align: "right" as const },
              { id: "status", label: "Estado" },
              { id: "created", label: "Creada" },
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
                    "px-3.5 py-4 border-b border-rule align-middle text-sm text-ink",
                    isSelected
                      ? "shadow-[inset_3px_0_0_var(--color-sage)]"
                      : "",
                  ].join(" ")}
                >
                  <p className="font-serif italic font-medium text-[15px] text-ink m-0 tracking-[-0.01em]">
                    {r.name}
                  </p>
                  <p className="text-xs text-ink-muted m-0 font-mono">
                    /p/{r.slug}
                  </p>
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-sm text-ink-soft">
                  {r.organization?.name ?? <span className="text-ink-muted">—</span>}
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-sm text-ink-soft">
                  {r.city ?? <span className="text-ink-muted">—</span>}
                </td>
                <td
                  className="px-3.5 py-4 border-b border-rule align-middle text-sm text-right"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.roomsCount}
                </td>
                <td
                  className="px-3.5 py-4 border-b border-rule align-middle text-sm text-right"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.bookingsCount}
                </td>
                <td className="px-3.5 py-4 border-b border-rule align-middle text-sm">
                  {r.isActive ? (
                    <span className="inline-flex items-center h-6 px-2 rounded-full text-[11.5px] font-medium bg-sage-tint text-sage">
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center h-6 px-2 rounded-full text-[11.5px] font-medium bg-linen text-ink-muted">
                      Inactiva
                    </span>
                  )}
                </td>
                <td
                  className="px-3.5 py-4 border-b border-rule align-middle text-sm text-ink-soft whitespace-nowrap"
                  style={{
                    fontVariantNumeric: "oldstyle-nums tabular-nums",
                    fontFeatureSettings: '"onum","tnum"',
                  }}
                >
                  {formatDate(r.createdAt)}
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
                No hay propiedades que coincidan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
