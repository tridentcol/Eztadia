import Link from "next/link";
import type {
  MonthlyRevenuePoint,
  PaymentMethodBreakdownRow,
  ReportMetrics,
  RoomTypeBreakdownRow,
} from "@/lib/db/queries/reports";
import { formatCOP } from "@/lib/format";
import { IconBuilding, IconClock, IconMoon, IconTrend } from "./icons";

export type PeriodPreset =
  | "this-month"
  | "last-month"
  | "last-30"
  | "last-90"
  | "ytd";

const PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: "this-month", label: "Este mes" },
  { id: "last-month", label: "Mes pasado" },
  { id: "last-30", label: "Últimos 30 días" },
  { id: "last-90", label: "Últimos 90 días" },
  { id: "ytd", label: "Año en curso" },
];

const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const MONTHS_LONG = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pse: "PSE (Wompi)",
  manual_transfer: "Transferencia manual",
  external: "Reservado externo",
  admin_override: "Asignación admin",
};

function formatPeriodLabel(fromIso: string, toIso: string): string {
  const a = parseIso(fromIso);
  const b = parseIso(toIso);
  // `to` es exclusivo: muestra el día anterior como cierre humano
  const closeDate = new Date(Date.UTC(b.y, b.m - 1, b.d - 1));
  const sameMonth = a.y === closeDate.getUTCFullYear() && a.m - 1 === closeDate.getUTCMonth();
  if (sameMonth && a.d === 1 && closeDate.getUTCDate() >= 28) {
    return `${MONTHS_LONG[a.m - 1]} ${a.y}`;
  }
  return `${a.d} ${MONTHS_SHORT[a.m - 1]} ${String(a.y).slice(-2)} – ${closeDate.getUTCDate()} ${MONTHS_SHORT[closeDate.getUTCMonth()]} ${String(closeDate.getUTCFullYear()).slice(-2)}`;
}

function parseIso(iso: string) {
  return {
    y: Number(iso.slice(0, 4)),
    m: Number(iso.slice(5, 7)),
    d: Number(iso.slice(8, 10)),
  };
}

function copShort(cents: number): string {
  const v = Math.round(cents / 100);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return formatCOP(v);
}

export function ReportsView({
  preset,
  from,
  to,
  metrics,
  monthly,
  byRoomType,
  byPaymentMethod,
}: {
  preset: PeriodPreset;
  from: string;
  to: string;
  metrics: ReportMetrics;
  monthly: MonthlyRevenuePoint[];
  byRoomType: RoomTypeBreakdownRow[];
  byPaymentMethod: PaymentMethodBreakdownRow[];
}) {
  const periodLabel = formatPeriodLabel(from, to);

  return (
    <div className="pb-12">
      <header className="mb-8">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
          Propiedad
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif italic font-medium text-[32px] sm:text-[36px] text-ink m-0 tracking-[-0.02em] leading-[1.05]">
            Reportes
          </h1>
          <p className="text-[13px] text-ink-soft m-0">
            <span className="font-serif italic">{periodLabel}</span>
            <span className="text-ink-muted"> · {metrics.daysInPeriod} días</span>
          </p>
        </div>
      </header>

      <nav
        aria-label="Período de reporte"
        className="flex flex-wrap gap-2 mb-10"
      >
        {PRESETS.map((p) => {
          const active = p.id === preset;
          return (
            <Link
              key={p.id}
              href={`/dashboard/reports?p=${p.id}`}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-block text-[12.5px] px-3.5 py-1.5 rounded-full border transition-colors",
                active
                  ? "bg-sage-tint border-sage-tint text-sage font-medium"
                  : "bg-paper border-rule text-ink-soft hover:text-ink hover:border-ink-muted",
              ].join(" ")}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>

      {metrics.activeRooms === 0 ? (
        <NoRoomsState />
      ) : (
        <HeroStrip metrics={metrics} />
      )}

      <section className="mt-14">
        <header className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif italic font-medium text-[22px] text-ink m-0 tracking-[-0.01em]">
            Ingresos · últimos {monthly.length} meses
          </h2>
          <span className="text-[12px] text-ink-muted">
            Total {copShort(monthly.reduce((acc, m) => acc + m.revenueCents, 0))}
          </span>
        </header>
        <RevenueChart points={monthly} />
      </section>

      <section className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <header className="mb-4">
            <h2 className="font-serif italic font-medium text-[18px] text-ink m-0">
              Por tipo de habitación
            </h2>
            <p className="text-[12px] text-ink-muted m-0 mt-1">
              Ingresos del período por categoría
            </p>
          </header>
          <RoomTypeTable rows={byRoomType} />
        </div>

        <div>
          <header className="mb-4">
            <h2 className="font-serif italic font-medium text-[18px] text-ink m-0">
              Por medio de pago
            </h2>
            <p className="text-[12px] text-ink-muted m-0 mt-1">
              Cómo cobraste las reservas del período
            </p>
          </header>
          <PaymentMethodTable rows={byPaymentMethod} totalCents={metrics.revenueCents} />
        </div>
      </section>

      <section className="mt-14">
        <header className="mb-4">
          <h2 className="font-serif italic font-medium text-[18px] text-ink m-0">
            Operación
          </h2>
        </header>
        <SecondaryStats metrics={metrics} />
      </section>

      <footer className="mt-12 pt-6 border-t border-rule text-[11.5px] text-ink-muted leading-relaxed">
        <p className="m-0">
          <strong className="font-medium text-ink-soft">Convención:</strong>{" "}
          cada reserva se atribuye al período en el que cae su <em>check-in</em>.
          Se excluyen reservas canceladas y no-show. ADR = ingresos / noches vendidas.
          RevPAR = ingresos / (habitaciones activas × días del período).
        </p>
      </footer>
    </div>
  );
}

function HeroStrip({ metrics }: { metrics: ReportMetrics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-rule">
      <HeroCell
        label="Ocupación"
        value={`${metrics.occupancyPct}%`}
        sub={`${metrics.nights} noches vendidas`}
      />
      <HeroCell
        label="ADR"
        value={copShort(metrics.adrCents)}
        sub="Tarifa promedio por noche"
        bordered
      />
      <HeroCell
        label="RevPAR"
        value={copShort(metrics.revparCents)}
        sub="Ingreso por habitación disponible"
        bordered
      />
      <HeroCell
        label="Ingresos"
        value={copShort(metrics.revenueCents)}
        sub={`${metrics.bookings} reservas`}
        bordered
      />
    </div>
  );
}

function HeroCell({
  label,
  value,
  sub,
  bordered = false,
}: {
  label: string;
  value: string;
  sub: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={[
        "py-6 px-5",
        bordered ? "lg:border-l border-rule" : "",
      ].join(" ")}
    >
      <p className="text-[11px] tracking-[0.08em] uppercase text-ink-muted font-medium m-0 mb-2">
        {label}
      </p>
      <p
        className="font-serif font-medium text-ink leading-none oldstyle tracking-[-0.02em] m-0"
        style={{ fontSize: 40 }}
      >
        {value}
      </p>
      <p className="text-[11.5px] text-ink-muted mt-2 m-0">{sub}</p>
    </div>
  );
}

function RevenueChart({ points }: { points: MonthlyRevenuePoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.revenueCents));
  const W = 800;
  const H = 220;
  const PAD_L = 0;
  const PAD_R = 0;
  const PAD_T = 18;
  const PAD_B = 30;
  const usableW = W - PAD_L - PAD_R;
  const usableH = H - PAD_T - PAD_B;
  const bandW = points.length > 0 ? usableW / points.length : usableW;
  const barW = Math.max(8, bandW * 0.55);

  const allZero = points.every((p) => p.revenueCents === 0);

  return (
    <div className="bg-paper border border-rule rounded-2xl px-5 sm:px-6 pt-5 pb-3">
      {allZero ? (
        <div className="py-10 text-center text-[13px] text-ink-muted">
          Sin ingresos registrados en los últimos {points.length} meses.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          role="img"
          aria-label="Ingresos mensuales"
          preserveAspectRatio="none"
        >
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={H - PAD_B}
            y2={H - PAD_B}
            stroke="var(--rule)"
            strokeWidth={1}
          />
          {points.map((p, i) => {
            const cx = PAD_L + bandW * i + bandW / 2;
            const h = p.revenueCents > 0 ? (p.revenueCents / max) * usableH : 0;
            const y = PAD_T + (usableH - h);
            const isLast = i === points.length - 1;
            const isMax = p.revenueCents === max && max > 0;
            const fill = isLast ? "var(--gold)" : isMax ? "var(--sage)" : "var(--sage)";
            const opacity = isLast || isMax ? 1 : 0.55;
            const monthIdx = Number(p.monthIso.slice(5, 7)) - 1;
            return (
              <g key={p.monthIso}>
                <rect
                  x={cx - barW / 2}
                  y={y}
                  width={barW}
                  height={Math.max(0, h)}
                  rx={3}
                  fill={fill}
                  opacity={opacity}
                >
                  <title>
                    {MONTHS_LONG[monthIdx]} {p.monthIso.slice(0, 4)}: {copShort(p.revenueCents)}
                    {" · "}
                    {p.bookings} reservas
                  </title>
                </rect>
                <text
                  x={cx}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--ink-muted)"
                  fontFamily="var(--font-inter), system-ui, sans-serif"
                >
                  {MONTHS_SHORT[monthIdx]}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function RoomTypeTable({ rows }: { rows: RoomTypeBreakdownRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper border border-rule rounded-2xl p-6 text-[13px] text-ink-muted">
        Sin reservas en el período.
      </div>
    );
  }
  const total = rows.reduce((acc, r) => acc + r.revenueCents, 0);
  return (
    <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
      {rows.map((r, i) => {
        const pct = total > 0 ? (r.revenueCents / total) * 100 : 0;
        return (
          <div
            key={r.roomTypeId}
            className={[
              "px-5 py-3.5 flex items-center gap-4",
              i > 0 ? "border-t border-rule" : "",
            ].join(" ")}
          >
            <div className="flex-1 min-w-0">
              <p className="font-serif italic font-medium text-[14px] text-ink m-0 truncate">
                {r.nameEs}
              </p>
              <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
                {r.bookings} reservas · {r.nights} noches · ADR {copShort(r.adrCents)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-serif oldstyle text-[16px] text-ink m-0 tabular-nums">
                {copShort(r.revenueCents)}
              </p>
              <p className="text-[11px] text-ink-muted m-0 mt-0.5 tabular-nums">
                {pct.toFixed(0)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentMethodTable({
  rows,
  totalCents,
}: {
  rows: PaymentMethodBreakdownRow[];
  totalCents: number;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-paper border border-rule rounded-2xl p-6 text-[13px] text-ink-muted">
        Sin pagos en el período.
      </div>
    );
  }
  return (
    <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
      {rows.map((r, i) => {
        const pct = totalCents > 0 ? (r.revenueCents / totalCents) * 100 : 0;
        const label = PAYMENT_METHOD_LABEL[r.method] ?? r.method;
        return (
          <div
            key={r.method}
            className={[
              "px-5 py-3.5",
              i > 0 ? "border-t border-rule" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-ink m-0">{label}</p>
                <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
                  {r.bookings} reservas
                </p>
              </div>
              <p className="font-serif oldstyle text-[16px] text-ink m-0 tabular-nums shrink-0">
                {copShort(r.revenueCents)}
              </p>
            </div>
            <div className="mt-2 h-1 bg-linen rounded-full overflow-hidden">
              <span
                className="block h-full bg-sage rounded-full"
                style={{ width: `${Math.min(100, pct)}%` }}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecondaryStats({ metrics }: { metrics: ReportMetrics }) {
  const items = [
    {
      Icon: IconTrend,
      label: "Reservas confirmadas",
      value: String(metrics.bookings),
    },
    {
      Icon: IconMoon,
      label: "Noches vendidas",
      value: String(metrics.nights),
    },
    {
      Icon: IconBuilding,
      label: "Habitaciones activas",
      value: String(metrics.activeRooms),
    },
    {
      Icon: IconClock,
      label: "Estadía promedio",
      value: `${metrics.avgStayNights} noches`,
    },
    {
      Icon: IconClock,
      label: "Días para reservar",
      value: `${metrics.avgLeadDays} días`,
    },
    {
      Icon: IconBuilding,
      label: "Noches disponibles",
      value: String(metrics.activeRooms * metrics.daysInPeriod),
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-rule">
      {items.map((it, i) => {
        const Icon = it.Icon;
        return (
          <div
            key={it.label}
            className={[
              "py-5 px-4",
              i > 0 ? "border-l border-rule" : "",
              "max-sm:[&:nth-child(odd)]:border-l-0",
              "sm:max-lg:[&:nth-child(3n+1)]:border-l-0",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5 text-ink-muted mb-1.5">
              <Icon className="w-3.5 h-3.5" />
              <p className="text-[10.5px] tracking-[0.08em] uppercase font-medium m-0">
                {it.label}
              </p>
            </div>
            <p className="font-serif oldstyle text-[22px] text-ink m-0 leading-none tabular-nums">
              {it.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function NoRoomsState() {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-10 text-center">
      <p className="font-serif italic text-[20px] text-ink m-0 mb-2">
        Aún no hay habitaciones activas
      </p>
      <p className="text-[13px] text-ink-soft m-0 mb-4">
        Los reportes calculan ocupación y RevPAR sobre habitaciones activas.
        Activa al menos una en{" "}
        <Link href="/dashboard/rooms" className="text-sage underline">
          Habitaciones
        </Link>{" "}
        para ver datos significativos.
      </p>
    </div>
  );
}
