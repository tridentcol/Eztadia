"use client";

import { toCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { ReportBookingExport } from "@/lib/db/queries/reports";

const COLUMNS: CsvColumn<ReportBookingExport>[] = [
  { header: "Código", get: (r) => r.code },
  { header: "Estado", get: (r) => r.status },
  { header: "Canal", get: (r) => r.source },
  { header: "Check-in", get: (r) => r.checkIn },
  { header: "Check-out", get: (r) => r.checkOut },
  { header: "Noches", get: (r) => r.nights },
  { header: "Huésped", get: (r) => r.guestFullName },
  { header: "Email", get: (r) => r.guestEmail },
  { header: "Teléfono", get: (r) => r.guestPhone },
  { header: "País", get: (r) => r.guestCountry },
  { header: "Adultos", get: (r) => r.adults },
  { header: "Niños", get: (r) => r.children },
  { header: "Total (COP)", get: (r) => Math.round(r.totalCents / 100) },
  { header: "Método de pago", get: (r) => r.paymentMethod },
  { header: "Tipo de habitación", get: (r) => r.roomTypeName },
  { header: "Habitación", get: (r) => r.roomNumber ?? "" },
  { header: "Creada", get: (r) => r.createdAt },
];

export function ExportCsvButton({
  bookings,
  from,
  to,
}: {
  bookings: ReportBookingExport[];
  from: string;
  to: string;
}) {
  const disabled = bookings.length === 0;

  function handleClick() {
    const csv = toCsv(bookings, COLUMNS);
    downloadCsv(`reportes-${from}_${to}.csv`, csv);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? "Sin datos para exportar" : `Exportar ${bookings.length} reservas`}
      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium text-sage border border-sage bg-transparent hover:bg-sage-tint disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg
        className="w-[14px] h-[14px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 4v12" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
      Exportar CSV
    </button>
  );
}
