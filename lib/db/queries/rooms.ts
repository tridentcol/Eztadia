import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type RoomTypeRow = Database["public"]["Tables"]["room_types"]["Row"];
type RoomRow     = Database["public"]["Tables"]["rooms"]["Row"];
type SeasonalRateRow = Database["public"]["Tables"]["seasonal_rates"]["Row"];

export type RoomTypeWithRates = RoomTypeRow & { seasonal_rates: SeasonalRateRow[] };

/**
 * Carga un room_type por id. Si `asAdmin`, bypass RLS — uso valido en el
 * flow publico /p/[slug]/booking/new donde el guest selecciono un room_type
 * desde el widget y necesitamos su base_price_cents para computar total.
 */
export async function getRoomTypeById(
  id: string,
  opts: { asAdmin?: boolean } = {},
): Promise<RoomTypeRow | null> {
  const client = opts.asAdmin ? createAdminClient() : await createClient();
  const { data, error } = await client
    .from("room_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapDbError(error);
  return data;
}

/**
 * Lista room_types activos de una propiedad, con sus seasonal_rates.
 * RLS: members ven todo; anon solo si propiedad+room_type activos.
 */
export async function listRoomTypes(propertyId: string): Promise<RoomTypeWithRates[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("*, seasonal_rates(*)")
    .eq("property_id", propertyId)
    .order("base_price_cents", { ascending: true });

  if (error) throw mapDbError(error);
  return (data ?? []) as unknown as RoomTypeWithRates[];
}

/**
 * Lista rooms fisicos de una propiedad, opcionalmente filtrado por room_type.
 */
export async function listRooms(
  propertyId: string,
  opts: { roomTypeId?: string; onlyActive?: boolean } = {},
): Promise<RoomRow[]> {
  const supabase = await createClient();
  let q = supabase.from("rooms").select("*").eq("property_id", propertyId);

  if (opts.roomTypeId) q = q.eq("room_type_id", opts.roomTypeId);
  if (opts.onlyActive) q = q.eq("is_active", true);

  const { data, error } = await q.order("number", { ascending: true });
  if (error) throw mapDbError(error);
  return data ?? [];
}
