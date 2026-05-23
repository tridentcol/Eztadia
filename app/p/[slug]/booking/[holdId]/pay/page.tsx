import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPropertyBySlug } from "@/lib/db/queries/property";
import { getRoomTypeById } from "@/lib/db/queries/rooms";
import { getHoldById } from "@/lib/db/queries/holds";
import { buildHoldFromRow } from "@/lib/booking/adapter";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { Stepper } from "@/components/booking-flow/Stepper";
import { PaySectionPSE } from "@/components/booking-flow/PaySectionPSE";
import { PaySectionManual } from "@/components/booking-flow/PaySectionManual";

export const metadata: Metadata = {
  title: "Reserva · Pago",
};

export default async function PayPage({
  params,
}: {
  params: Promise<{ slug: string; holdId: string }>;
}) {
  const { slug, holdId } = await params;

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const holdRow = await getHoldById(holdId);
  if (!holdRow || holdRow.property_id !== property.id) notFound();

  // Si el hold ya no esta activo (expirado, convertido, cancelado), mandamos
  // al guest a la pantalla de status para que vea el resultado.
  if (holdRow.status !== "active") {
    redirect(`/p/${slug}/booking/${holdId}/status`);
  }

  const roomType = await getRoomTypeById(holdRow.room_type_id);
  if (!roomType) notFound();

  const hold = buildHoldFromRow({ hold: holdRow, property, roomType });

  return (
    <>
      <BookingFlowTopbar hold={hold} />
      <Stepper current="pago" />

      <main className="max-w-[600px] mx-auto px-5 sm:px-8 pb-24">
        {holdRow.payment_method === "pse" ? (
          <PaySectionPSE hold={hold} />
        ) : (
          <PaySectionManual hold={hold} />
        )}
      </main>
    </>
  );
}
