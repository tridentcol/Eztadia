import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/properties";
import { getDemoHold } from "@/lib/booking-flow";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { Stepper } from "@/components/booking-flow/Stepper";
import { SummaryCard } from "@/components/booking-flow/SummaryCard";
import { BookingForm } from "@/components/booking-flow/BookingForm";

export const metadata: Metadata = {
  title: "Reserva · Tus datos — Casa Marina",
};

export default async function BookingNewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();
  const hold = getDemoHold();

  return (
    <>
      <BookingFlowTopbar hold={hold} />
      <Stepper current="datos" />

      <main className="max-w-[720px] mx-auto px-5 sm:px-8 pb-24">
        <SummaryCard hold={hold} />

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

        <BookingForm hold={hold} />
      </main>
    </>
  );
}
