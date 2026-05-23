import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPropertyBySlug } from "@/lib/db/queries/property";
import { getRoomTypeById } from "@/lib/db/queries/rooms";
import { buildDraftHold } from "@/lib/booking/adapter";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { Stepper } from "@/components/booking-flow/Stepper";
import { SummaryCard } from "@/components/booking-flow/SummaryCard";
import { BookingForm } from "@/components/booking-flow/BookingForm";

export const metadata: Metadata = {
  title: "Reserva · Tus datos",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

function parseIntSafe(v: string | undefined, fallback: number, min: number, max: number): number {
  if (!v) return fallback;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export default async function BookingNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    adults?: string;
    children?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  // Si faltan params criticos, mandamos al guest de vuelta al picker del
  // property page (BookingWidget seteara los params en el link al hacer click).
  if (!sp.checkIn || !sp.checkOut || !sp.roomTypeId) {
    redirect(`/p/${slug}`);
  }
  if (!ISO_DATE.test(sp.checkIn) || !ISO_DATE.test(sp.checkOut) || sp.checkIn >= sp.checkOut) {
    redirect(`/p/${slug}`);
  }

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const roomType = await getRoomTypeById(sp.roomTypeId);
  if (!roomType || roomType.property_id !== property.id) notFound();

  const adults = parseIntSafe(sp.adults, 2, 1, 10);
  const childrenCount = parseIntSafe(sp.children, 0, 0, 10);
  const nights = nightsBetween(sp.checkIn, sp.checkOut);
  const totalCents = roomType.base_price_cents * nights;

  const draft = buildDraftHold({
    property,
    roomType,
    checkIn: sp.checkIn,
    checkOut: sp.checkOut,
    adults,
    children: childrenCount,
    totalCents,
  });

  return (
    <>
      <BookingFlowTopbar hold={draft} />
      <Stepper current="datos" />

      <main className="max-w-[720px] mx-auto px-5 sm:px-8 pb-24">
        <SummaryCard hold={draft} />

        <header className="mt-10 mb-6">
          <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
            Tus datos
          </span>
          <h1 className="font-serif font-medium text-[clamp(28px,4vw,32px)] text-ink m-0 mb-2.5 tracking-[-0.025em] leading-[1.1]">
            Cuéntanos quién eres.
          </h1>
          <p className="text-[15px] leading-[1.55] text-ink-soft max-w-[56ch] m-0">
            Necesitamos esto para confirmar tu reserva. Cifrado end-to-end. No compartimos con terceros.
          </p>
        </header>

        <BookingForm
          hold={draft}
          context={{
            propertyId: property.id,
            roomTypeId: roomType.id,
            checkIn: sp.checkIn,
            checkOut: sp.checkOut,
            adults,
            children: childrenCount,
          }}
        />
      </main>
    </>
  );
}
