import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, ValidationError } from "@/lib/errors";

export type AvailabilityResult = {
  available_rooms: number;
  total_rooms: number;
};

/**
 * Llama a la SQL function `check_availability` (fuente unica de verdad de
 * disponibilidad). Considera bookings + external_blocks + holds activos.
 *
 * Permite anon (la function tiene GRANT a anon/authenticated/service_role).
 *
 * @param checkIn  ISO date "YYYY-MM-DD" (inclusivo)
 * @param checkOut ISO date "YYYY-MM-DD" (exclusivo)
 */
export async function checkAvailability(args: {
  propertyId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
}): Promise<AvailabilityResult> {
  if (!args.checkIn || !args.checkOut) {
    throw new ValidationError("Fechas requeridas.");
  }
  if (args.checkIn >= args.checkOut) {
    throw new ValidationError("La salida debe ser despues de la entrada.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_availability", {
    p_property_id: args.propertyId,
    p_room_type_id: args.roomTypeId,
    p_check_in: args.checkIn,
    p_check_out: args.checkOut,
  });

  if (error) throw mapDbError(error);

  // RPC devuelve un array de un solo elemento (RETURNS TABLE).
  const row = Array.isArray(data) ? data[0] : data;
  return {
    available_rooms: Number(row?.available_rooms ?? 0),
    total_rooms: Number(row?.total_rooms ?? 0),
  };
}
