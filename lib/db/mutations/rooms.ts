import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ConflictError, mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type RoomTypeRow    = Database["public"]["Tables"]["room_types"]["Row"];
type RoomTypeInsert = Database["public"]["Tables"]["room_types"]["Insert"];
type RoomTypeUpdate = Database["public"]["Tables"]["room_types"]["Update"];
type RoomRow        = Database["public"]["Tables"]["rooms"]["Row"];
type RoomInsert     = Database["public"]["Tables"]["rooms"]["Insert"];
type RoomUpdate     = Database["public"]["Tables"]["rooms"]["Update"];

/* ─── ROOM TYPES ─── */

export async function createRoomType(input: {
  propertyId: string;
  nameEs: string;
  nameEn?: string | null;
  descriptionEs?: string | null;
  basePriceCents: number;
  capacityAdults: number;
  capacityChildren?: number;
  sizeM2?: number | null;
  bedConfiguration?: string | null;
  amenities?: string[];
}): Promise<RoomTypeRow> {
  const supabase = await createClient();

  const payload: RoomTypeInsert = {
    property_id: input.propertyId,
    name_es: input.nameEs,
    name_en: input.nameEn ?? null,
    description_es: input.descriptionEs ?? null,
    base_price_cents: input.basePriceCents,
    capacity_adults: input.capacityAdults,
    capacity_children: input.capacityChildren ?? 0,
    size_m2: input.sizeM2 ?? null,
    bed_configuration: input.bedConfiguration ?? null,
    amenities: input.amenities ?? [],
  };

  const { data, error } = await supabase
    .from("room_types")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Tipo de habitacion");
  return data;
}

export async function updateRoomType(
  id: string,
  patch: RoomTypeUpdate,
): Promise<RoomTypeRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Tipo de habitacion");
  return data;
}

/* ─── ROOMS (FISICAS) ─── */

export async function createRoom(input: {
  propertyId: string;
  roomTypeId: string;
  number: string;
  floor?: string | null;
  notes?: string | null;
}): Promise<RoomRow> {
  const supabase = await createClient();

  const payload: RoomInsert = {
    property_id: input.propertyId,
    room_type_id: input.roomTypeId,
    number: input.number,
    floor: input.floor ?? null,
    notes: input.notes ?? null,
  };

  const { data, error } = await supabase
    .from("rooms")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) {
    // UNIQUE (property_id, number)
    if (error.code === "23505") throw new ConflictError("Ese numero de habitacion ya esta en uso.");
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Habitacion");
  return data;
}

export async function updateRoom(
  id: string,
  patch: RoomUpdate,
): Promise<RoomRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") throw new ConflictError("Ese numero de habitacion ya esta en uso.");
    throw mapDbError(error);
  }
  if (!data) throw new NotFoundError("Habitacion");
  return data;
}
