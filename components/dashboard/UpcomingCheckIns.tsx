import Link from "next/link";
import { IconArrowRight } from "./icons";
import type { CheckIn } from "@/lib/dashboard";

export function UpcomingCheckIns({ items }: { items: CheckIn[] }) {
  return (
    <section className="mt-20" aria-labelledby="checkins-title">
      <header className="mb-6">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-2">
          Próximos 7 días
        </span>
        <h3 id="checkins-title" className="font-serif italic font-medium text-ink m-0 tracking-[-0.015em]" style={{ fontSize: 22 }}>
          Quién llega.
        </h3>
      </header>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse border-t border-b border-rule">
          <thead>
            <tr>
              {["Huésped", "Habitación", "Llega", "Se va", "Estado"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="text-left text-[11px] font-medium tracking-[0.05em] uppercase text-ink-muted px-4 py-3.5 border-b border-rule bg-cream"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <CheckInRow key={row.id} row={row} stripe={i % 2 === 1} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {items.map((row) => (
          <CheckInCard key={row.id} row={row} />
        ))}
      </div>

      <div className="mt-5">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage border-b border-transparent hover:border-sage transition-colors pb-px"
        >
          Ver todas las reservas
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

function CheckInRow({ row, stripe }: { row: CheckIn; stripe: boolean }) {
  const href = row.status === "blocked" ? undefined : `/dashboard/bookings/${row.id}`;
  return (
    <tr
      className={`${stripe ? "[&>td]:bg-paper" : ""} cursor-pointer hover:[&>td]:bg-linen transition-colors`}
      onClick={href ? () => (window.location.href = href) : undefined}
    >
      <td className="p-4 border-b border-rule">
        {row.guest ? (
          <span className="font-serif italic font-medium text-ink text-[15px]">{row.guest}</span>
        ) : (
          <span className="font-serif italic text-ink-muted text-[15px]">— sin huésped —</span>
        )}
      </td>
      <td className="p-4 border-b border-rule">
        <span className="text-sm text-ink-soft">
          {row.room} <strong className="text-ink font-medium">{row.roomNumber}</strong>
        </span>
      </td>
      <td className="p-4 border-b border-rule">
        <span className="text-sm text-ink oldstyle">
          {row.arrival.dayLabel === "Hoy" ? <strong className="font-sans font-medium">Hoy</strong> : row.arrival.dayLabel}
          {row.arrival.time && (
            <>
              {", "}
              <span className="oldstyle">{row.arrival.time}</span>
            </>
          )}
          {row.arrival.dayLabel !== "Hoy" && row.arrival.dayLabel !== "Mañana" && (
            <> </>
          )}
          {row.arrival.dayLabel !== "Hoy" && (
            <small className="block text-[12px] text-ink-muted mt-0.5">
              {formatRowDate(row.arrival.isoDate)}
            </small>
          )}
          {row.arrival.dayLabel === "Hoy" && (
            <small className="block text-[12px] text-ink-muted mt-0.5">21 may</small>
          )}
        </span>
      </td>
      <td className="p-4 border-b border-rule">
        <span className="text-sm text-ink oldstyle">{row.departure.dayLabel} <span className="oldstyle">{formatRowDate(row.departure.isoDate)}</span></span>
      </td>
      <td className="p-4 border-b border-rule">
        <StatusPill status={row.status}>{row.statusLabel}</StatusPill>
      </td>
    </tr>
  );
}

function CheckInCard({ row }: { row: CheckIn }) {
  return (
    <Link
      href={row.status === "blocked" ? "#" : `/dashboard/bookings/${row.id}`}
      className="block bg-paper border border-rule rounded-2xl p-4 hover:border-rule-strong transition-colors"
      style={{ borderRadius: 14 }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span className={`font-serif italic font-medium text-[16px] ${row.guest ? "text-ink" : "text-ink-muted font-normal"}`}>
          {row.guest ?? "— sin huésped —"}
        </span>
        <StatusPill status={row.status}>{row.statusLabel}</StatusPill>
      </div>
      <div className="text-[13px] text-ink-soft flex gap-2 flex-wrap">
        <span>{row.room} <strong className="text-ink font-medium">{row.roomNumber}</strong></span>
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-rule flex justify-between gap-2 text-[13px] text-ink oldstyle">
        <span>
          <span className="block text-[11px] tracking-[0.05em] uppercase text-ink-muted mb-0.5 font-sans">Llega</span>
          {row.arrival.dayLabel === "Hoy" ? <strong className="font-sans font-medium">Hoy</strong> : row.arrival.dayLabel}
          {row.arrival.time && <>, <span className="oldstyle">{row.arrival.time}</span></>}
          {row.arrival.dayLabel !== "Hoy" && (
            <> <span className="oldstyle">{formatRowDate(row.arrival.isoDate)}</span></>
          )}
        </span>
        <span>
          <span className="block text-[11px] tracking-[0.05em] uppercase text-ink-muted mb-0.5 font-sans">Se va</span>
          {row.departure.dayLabel} <span className="oldstyle">{formatRowDate(row.departure.isoDate)}</span>
        </span>
      </div>
    </Link>
  );
}

function StatusPill({ status, children }: { status: CheckIn["status"]; children: React.ReactNode }) {
  const map = {
    confirmed: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    "payment-pending": "bg-[rgba(184,146,62,0.14)] text-gold border-[rgba(184,146,62,0.18)]",
    blocked: "bg-linen text-ink-soft border-rule",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border ${map[status]}`}
    >
      {children}
    </span>
  );
}

const MONTHS_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function formatRowDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_ABBR[m - 1]}`;
}
