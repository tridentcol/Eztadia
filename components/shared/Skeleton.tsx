import type { CSSProperties, JSX } from "react";

/** Single shimmer block. */
export function SkeletonBar({
  width,
  height = 12,
  className = "",
  rounded = "default",
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
  rounded?: "default" | "circle" | "pill" | "huge";
}) {
  const radius = {
    default: "rounded-md",
    circle: "rounded-full",
    pill: "rounded-full",
    huge: "rounded-[20px]",
  }[rounded];
  return (
    <span
      aria-hidden
      className={`shimmer block ${radius} ${className}`}
      style={{ width, height }}
    />
  );
}

/** Composed: bookings table skeleton (header + 6 rows). */
export function BookingsTableSkeleton() {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-6">
      {/* Header row */}
      <div
        className="grid items-center gap-3.5 py-3 border-b border-rule"
        style={{ gridTemplateColumns: "100px 1fr 90px 90px 90px 60px" }}
      >
        <SkeletonBar height={10} width="80%" />
        <SkeletonBar height={10} width="60%" />
        <SkeletonBar height={10} width="70%" />
        <SkeletonBar height={10} width="70%" />
        <SkeletonBar height={10} width="60%" />
        <SkeletonBar height={10} width="50%" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center gap-3.5 py-4 border-b border-rule last:border-b-0"
          style={{ gridTemplateColumns: "100px 1fr 90px 90px 90px 60px" }}
        >
          <SkeletonBar height={12} width="90%" />
          <div className="flex items-center gap-3">
            <SkeletonBar width={24} height={24} rounded="circle" />
            <SkeletonBar height={13} className="flex-1" />
          </div>
          <SkeletonBar height={12} />
          <SkeletonBar height={12} />
          <SkeletonBar height={18} width="80%" rounded="pill" />
          <SkeletonBar height={12} width="50%" />
        </div>
      ))}
    </div>
  );
}

/** Composed: calendar timeline skeleton. */
export function CalendarSkeleton() {
  const rows = 6;
  // Generate pseudo-random booking spans per row, deterministic.
  const layout: { col: number; span: number }[][] = [
    [{ col: 2, span: 3 }, { col: 6, span: 2 }],
    [{ col: 3, span: 3 }],
    [{ col: 2, span: 1 }, { col: 5, span: 2 }],
    [{ col: 3, span: 2 }, { col: 7, span: 1 }],
    [{ col: 5, span: 3 }],
    [{ col: 2, span: 2 }, { col: 7, span: 1 }],
  ];
  return (
    <div
      className="bg-paper border border-rule rounded-2xl p-3 grid gap-1.5"
      style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
    >
      {Array.from({ length: rows }).map((_, r) => {
        const occupied = new Set<number>();
        layout[r % layout.length].forEach((b) => {
          for (let k = 0; k < b.span; k++) occupied.add(b.col + k);
        });
        const cells: JSX.Element[] = [];
        // Room label
        cells.push(
          <div key={`r-${r}`} className="flex items-center px-1.5 min-h-[32px]">
            <SkeletonBar height={14} width="70%" />
          </div>,
        );
        // 7 day cells with possible bookings
        for (let c = 1; c <= 7; c++) {
          const booking = layout[r % layout.length].find((b) => b.col === c);
          if (booking) {
            cells.push(
              <span
                key={`c-${r}-${c}`}
                className="shimmer rounded"
                style={{ gridColumn: `span ${booking.span} / span ${booking.span}`, minHeight: 32 }}
              />,
            );
            c += booking.span - 1;
          } else if (!occupied.has(c)) {
            cells.push(
              <span
                key={`c-${r}-${c}`}
                aria-hidden
                className="bg-linen rounded"
                style={{ minHeight: 32 } as CSSProperties}
              />,
            );
          }
        }
        return <div key={r} className="contents">{cells}</div>;
      })}
    </div>
  );
}

/** Composed: property public page skeleton (hero + 3 room cards). */
export function PropertyPageSkeleton() {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-6">
      <SkeletonBar height={160} rounded="huge" className="mb-5" />
      <div className="flex flex-col gap-2 mb-5">
        <SkeletonBar height={18} width="60%" />
        <SkeletonBar height={12} width="80%" />
        <SkeletonBar height={12} width="45%" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center gap-3.5 py-3.5 border-b border-rule last:border-b-0"
          style={{ gridTemplateColumns: "80px 1fr 80px" }}
        >
          <SkeletonBar height={60} rounded="huge" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBar height={16} width="60%" />
            <SkeletonBar height={11} width="80%" />
            <SkeletonBar height={11} width="50%" />
          </div>
          <SkeletonBar height={32} width={80} rounded="pill" />
        </div>
      ))}
    </div>
  );
}

/** Composed: dashboard overview skeleton. */
export function DashboardOverviewSkeleton() {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-6">
      <SkeletonBar height={28} width="60%" className="mb-2" />
      <SkeletonBar height={14} width="80%" className="mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-5">
        <div className="flex flex-col gap-3">
          <SkeletonBar height={16} width="40%" />
          <RowSkeleton />
          <RowSkeleton />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonBar height={16} width="50%" />
          <ColMetric />
          <ColMetric />
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-3 p-3 border border-rule rounded-xl">
      <SkeletonBar width={44} height={44} rounded="circle" />
      <div className="flex-1 flex flex-col gap-1.5">
        <SkeletonBar height={12} width="50%" />
        <SkeletonBar height={10} width="70%" />
        <SkeletonBar height={16} width={100} rounded="pill" />
      </div>
      <SkeletonBar height={30} width={100} rounded="pill" />
    </div>
  );
}

function ColMetric() {
  return (
    <div className="py-3 border-b border-rule last:border-b-0">
      <SkeletonBar height={10} width="60%" className="mb-1.5" />
      <SkeletonBar height={22} width="55%" />
    </div>
  );
}

/** Composed: drawer detail skeleton. */
export function DrawerDetailSkeleton() {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-7">
      <div className="flex items-center justify-between pb-4 border-b border-rule">
        <SkeletonBar height={12} width={120} />
        <SkeletonBar height={22} width={90} rounded="pill" />
      </div>
      <div className="mt-5">
        <SkeletonBar width={64} height={64} rounded="circle" className="mb-3" />
        <SkeletonBar height={26} width="60%" className="mb-1.5" />
        <SkeletonBar height={12} width="80%" className="mb-5" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <SkeletonBar height={10} width={80} className="mb-1.5" />
            <SkeletonBar height={14} width={`${70 - i * 5}%`} />
          </div>
        ))}
      </div>
    </div>
  );
}
