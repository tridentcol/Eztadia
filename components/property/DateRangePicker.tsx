"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "./PhosphorIcons";
import { formatDateShort, isSameDay, isoDate } from "@/lib/format";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function buildMonthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // ES week starts Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isBefore(a: Date, b: Date) {
  return a < b && !isSameDay(a, b);
}

export function DateRangePicker({
  start,
  end,
  blockedDates,
  onChange,
}: {
  start: Date | null;
  end: Date | null;
  blockedDates: Set<string>;
  onChange: (start: Date | null, end: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<"in" | "out">("in");
  const [viewMonth, setViewMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const todayRef = useRef<Date>(new Date());

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleDayClick = (d: Date) => {
    if (!start || (start && end)) {
      onChange(d, null);
      setActiveField("out");
    } else if (isBefore(d, start)) {
      onChange(d, null);
    } else if (isSameDay(d, start)) {
      onChange(null, null);
    } else {
      onChange(start, d);
      setActiveField("in");
    }
  };

  const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

  return (
    <div ref={wrapRef} className="relative">
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-ink-muted mb-2">
        Fechas
      </span>

      <div
        className="grid grid-cols-2 border border-rule-strong overflow-hidden"
        style={{ borderRadius: 14 }}
      >
        <DateField
          label="Check-in"
          value={start ? formatDateShort(start) : null}
          active={open && activeField === "in"}
          onClick={() => {
            setActiveField("in");
            setOpen(true);
          }}
        />
        <DateField
          label="Check-out"
          value={end ? formatDateShort(end) : null}
          active={open && activeField === "out"}
          divider
          onClick={() => {
            setActiveField("out");
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Selecciona fechas"
          className="absolute left-0 right-0 z-30 bg-paper border border-rule p-5 mt-2"
          style={{ borderRadius: 16, boxShadow: "var(--shadow-pop, var(--shadow-soft))", top: "100%" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MonthView
              year={viewMonth.getFullYear()}
              month={viewMonth.getMonth()}
              today={todayRef.current}
              start={start}
              end={end}
              blocked={blockedDates}
              onPickDay={handleDayClick}
              navLeft={
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  aria-label="Mes anterior"
                  className="w-7 h-7 rounded-lg text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              }
            />
            <MonthView
              year={nextMonth.getFullYear()}
              month={nextMonth.getMonth()}
              today={todayRef.current}
              start={start}
              end={end}
              blocked={blockedDates}
              onPickDay={handleDayClick}
              navRight={
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  aria-label="Mes siguiente"
                  className="w-7 h-7 rounded-lg text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            />
          </div>

          <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-rule text-[13px] text-ink-soft">
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="text-ink-soft underline underline-offset-[3px] hover:text-ink"
            >
              Limpiar fechas
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 px-4 rounded-[10px] bg-ink text-cream text-[13px] font-medium hover:bg-[#2A241D] transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  active,
  divider,
  onClick,
}: {
  label: string;
  value: string | null;
  active: boolean;
  divider?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left px-3.5 py-3 transition-colors duration-200 bg-paper",
        active ? "bg-sage-tint" : "hover:bg-linen",
        divider ? "border-l border-rule-strong" : "",
      ].join(" ")}
    >
      <span className="block text-[10px] font-medium tracking-[0.14em] uppercase text-ink-muted mb-0.5">
        {label}
      </span>
      <span
        className={`flex items-center gap-2 text-sm ${
          value ? "text-ink font-medium" : "text-ink-muted font-normal"
        }`}
      >
        <Calendar className="w-3.5 h-3.5 text-ink-soft" />
        {value ?? "Selecciona"}
      </span>
    </button>
  );
}

function MonthView({
  year,
  month,
  today,
  start,
  end,
  blocked,
  onPickDay,
  navLeft,
  navRight,
}: {
  year: number;
  month: number;
  today: Date;
  start: Date | null;
  end: Date | null;
  blocked: Set<string>;
  onPickDay: (d: Date) => void;
  navLeft?: React.ReactNode;
  navRight?: React.ReactNode;
}) {
  const cells = buildMonthCells(year, month);
  const inRange = (d: Date) => start && end && d > start && d < end;
  const isStart = (d: Date) => isSameDay(d, start);
  const isEnd = (d: Date) => isSameDay(d, end);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {navLeft}
          <span className="font-serif italic font-medium text-ink tracking-[-0.01em]" style={{ fontSize: 18 }}>
            {MONTHS_ES[month]} <span className="oldstyle">{year}</span>
          </span>
        </div>
        {navRight}
      </div>

      <div className="grid grid-cols-7 text-[11px] tracking-[0.08em] uppercase text-ink-muted font-medium mb-1">
        {WEEKDAYS_ES.map((w) => (
          <span key={w} className="text-center py-1.5">{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[2px]">
        {cells.map((d, i) => {
          if (!d) return <span key={`e-${i}`} className="aspect-square" />;
          const past = isBefore(d, today);
          const blockedKey = blocked.has(isoDate(d));
          const disabled = past || blockedKey;
          const range = inRange(d);
          const sd = isStart(d);
          const ed = isEnd(d);

          let cls =
            "aspect-square inline-flex items-center justify-center font-serif text-[15px] cursor-pointer transition-colors duration-150 oldstyle ";
          if (disabled) cls += "text-ink-muted line-through opacity-50 cursor-not-allowed ";
          else cls += "text-ink hover:bg-linen ";
          if (range) cls += "bg-sage-tint rounded-none ";
          if (sd) cls += "bg-sage !text-cream rounded-l-lg ";
          if (ed) cls += "bg-sage !text-cream rounded-r-lg ";
          if (sd && ed) cls += "rounded-lg ";
          if (!sd && !ed && !range) cls += "rounded-lg ";

          return (
            <button
              key={isoDate(d)}
              type="button"
              disabled={disabled}
              onClick={() => onPickDay(d)}
              className={cls}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
