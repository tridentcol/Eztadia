import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/properties";
import { getDemoHold, type StatusVariant } from "@/lib/booking-flow";
import { BookingFlowTopbar } from "@/components/booking-flow/BookingFlowTopbar";
import { StatusScreen } from "@/components/booking-flow/StatusScreen";

export const metadata: Metadata = {
  title: "Reserva · Estado — Casa Marina",
};

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; holdId: string }>;
  searchParams: Promise<{ token?: string; v?: string }>;
}) {
  const { slug } = await params;
  const { v } = await searchParams;
  const property = getProperty(slug);
  if (!property) notFound();

  const hold = getDemoHold();
  // In production: derive variant from server-side reservation state (PSE webhook
  // result, manual review state, expiration). Demo uses ?v= for preview.
  const variant: StatusVariant =
    v === "waiting" ? "waiting" : v === "failed" ? "failed" : "confirmed";

  return (
    <>
      <BookingFlowTopbar hold={hold} showBack={false} />
      <StatusScreen hold={hold} variant={variant} />
    </>
  );
}
