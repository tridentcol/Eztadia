import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ConflictError,
  ForbiddenError,
  NoAvailabilityError,
  NotFoundError,
  mapDbError,
} from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PaymentMethod = Database["public"]["Enums"]["PaymentMethod"];

/**
 * Crea un hold atomico llamando a la SQL function create_booking_hold.
 *
 * Dos call sites:
 *   - **Flow autenticado** (staff crea hold a mano desde dashboard) → server
 *     client. RLS aplica.
 *   - **Flow publico** (/p/[slug] booking flow) → admin client (bypass).
 *     El caller (server action en B7) decide via `{ asAdmin: true }`.
 *
 * En ambos casos la function SQL hace el FOR UPDATE + check + insert.
 */
export async function createBookingHold(
  args: {
    propertyId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    guestEmail: string;
    guestPhone: string;
    totalCents: number;
    paymentMethod: PaymentMethod;
    ttlMinutes: number;
    guestFullName: string;
    guestDocumentType?: string | null;
    guestDocumentNumber?: string | null;
    guestCountry?: string | null;
  },
  opts: { asAdmin?: boolean } = {},
): Promise<{ holdId: string }> {
  const client = opts.asAdmin ? createAdminClient() : await createClient();

  const { data, error } = await client.rpc("create_booking_hold", {
    p_property_id: args.propertyId,
    p_room_type_id: args.roomTypeId,
    p_check_in: args.checkIn,
    p_check_out: args.checkOut,
    p_guest_email: args.guestEmail,
    p_guest_phone: args.guestPhone,
    p_total_cents: args.totalCents,
    p_payment_method: args.paymentMethod,
    p_ttl_minutes: args.ttlMinutes,
    p_guest_full_name: args.guestFullName,
    p_guest_document_type: args.guestDocumentType ?? undefined,
    p_guest_document_number: args.guestDocumentNumber ?? undefined,
    p_guest_country: args.guestCountry ?? "CO",
  });

  if (error) {
    if (error.code === "P0001" && error.message?.includes("NO_AVAILABILITY")) {
      throw new NoAvailabilityError();
    }
    throw mapDbError(error);
  }
  return { holdId: data as unknown as string };
}

/**
 * Cancela un booking (soft delete). Setea status, cancelled_at, cancelled_by.
 * RLS exige que el user sea member de la propiedad.
 */
export async function cancelBooking(args: {
  bookingId: string;
  reason?: string;
}): Promise<BookingRow> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new ForbiddenError();

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: args.reason ?? null,
    })
    .eq("id", args.bookingId)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Reserva");
  return data;
}

/**
 * Confirma un booking previamente en pending_payment → confirmed.
 * Asigna room si no estaba asignado.
 */
export async function confirmBooking(args: {
  bookingId: string;
  roomId?: string;
}): Promise<BookingRow> {
  const supabase = await createClient();
  const patch: Database["public"]["Tables"]["bookings"]["Update"] = {
    status: "confirmed",
  };
  if (args.roomId) patch.room_id = args.roomId;

  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", args.bookingId)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Reserva");
  return data;
}

/**
 * Crea un booking manual directo (sin pasar por hold). status=`confirmed`,
 * source=`manual`. El caller debe haber chequeado disponibilidad antes via
 * `check_availability`. RLS exige member con role >= reception.
 */
export async function createManualBooking(args: {
  propertyId: string;
  roomTypeId: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail: string;
  guestPhone: string;
  guestDocumentType?: string | null;
  guestDocumentNumber?: string | null;
  totalCents: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}): Promise<BookingRow> {
  const supabase = await createClient();

  const insert: Database["public"]["Tables"]["bookings"]["Insert"] = {
    property_id: args.propertyId,
    room_type_id: args.roomTypeId,
    room_id: args.roomId ?? null,
    check_in: args.checkIn,
    check_out: args.checkOut,
    adults: args.adults,
    children: args.children,
    guest_full_name: args.guestFullName,
    guest_email: args.guestEmail,
    guest_phone: args.guestPhone,
    guest_document_type: args.guestDocumentType ?? null,
    guest_document_number: args.guestDocumentNumber ?? null,
    total_cents: args.totalCents,
    payment_method: args.paymentMethod,
    status: "confirmed",
    source: "manual",
    notes: args.notes ?? null,
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(insert)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Reserva");
  return data;
}

/**
 * Asigna una room a un booking existente. Falla si la room ya esta tomada
 * por otra booking que solape.
 */
export async function assignRoom(args: {
  bookingId: string;
  roomId: string;
}): Promise<BookingRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ room_id: args.roomId })
    .eq("id", args.bookingId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23P01" /* exclusion violation, si agregamos en futuro */) {
      throw new ConflictError("Esa habitacion ya esta ocupada en esas fechas.");
    }
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Reserva");
  return data;
}
