import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/properties";
import { getDemoHold, type PaymentMethod } from "@/lib/booking-flow";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { Stepper } from "@/components/booking-flow/Stepper";
import { PaySectionPSE } from "@/components/booking-flow/PaySectionPSE";
import { PaySectionManual } from "@/components/booking-flow/PaySectionManual";

export const metadata: Metadata = {
  title: "Reserva · Pago — Casa Marina",
};

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; holdId: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { slug, holdId } = await params;
  const { m } = await searchParams;
  const property = getProperty(slug);
  if (!property) notFound();

  const hold = getDemoHold();
  // In production: validate holdId against backend. For demo we trust it.
  if (holdId !== hold.id) {
    // still render with demo hold for preview, but in prod we'd 404
  }
  const method: PaymentMethod = m === "manual" ? "manual" : "pse";

  return (
    <>
      <BookingFlowTopbar hold={hold} />
      <Stepper current="pago" />

      <main className="max-w-[600px] mx-auto px-5 sm:px-8 pb-24">
        {method === "pse" ? <PaySectionPSE hold={hold} /> : <PaySectionManual hold={hold} />}
      </main>
    </>
  );
}
