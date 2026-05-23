import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/db/queries/property";
import { getRoomTypeById } from "@/lib/db/queries/rooms";
import { getHoldById } from "@/lib/db/queries/holds";
import { buildHoldFromRow } from "@/lib/booking/adapter";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { StatusScreen } from "@/components/booking-flow/StatusScreen";
import type { StatusVariant } from "@/lib/booking-flow";

export const metadata: Metadata = {
  title: "Reserva · Estado",
};

function variantFromHoldStatus(
  status: string,
  override: string | undefined,
): StatusVariant {
  // ?v= override es util para preview / debug. Confirmacion real llega
  // cuando el webhook Wompi (C4) o el confirm manual (C5) muevan el hold
  // a 'converted' y creen la booking row.
  if (override === "waiting" || override === "failed" || override === "confirmed") {
    return override;
  }
  if (status === "converted") return "confirmed";
  if (status === "expired" || status === "cancelled") return "failed";
  return "waiting";
}

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; holdId: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { slug, holdId } = await params;
  const { v } = await searchParams;

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const holdRow = await getHoldById(holdId);
  if (!holdRow || holdRow.property_id !== property.id) notFound();

  const roomType = await getRoomTypeById(holdRow.room_type_id);
  if (!roomType) notFound();

  const hold = buildHoldFromRow({ hold: holdRow, property, roomType });
  const variant = variantFromHoldStatus(holdRow.status, v);

  return (
    <>
      <BookingFlowTopbar hold={hold} showBack={false} />
      <StatusScreen hold={hold} variant={variant} />
    </>
  );
}
