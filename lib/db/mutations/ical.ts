import "server-only";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type ICalDirection = Database["public"]["Enums"]["ICalDirection"];

export type IcalFeedInput = {
  propertyId: string;
  name: string;
  url: string;
  direction: ICalDirection;
  roomId: string | null;
  isActive: boolean;
};

export async function createIcalFeed(
  input: IcalFeedInput,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ical_feeds")
    .insert({
      property_id: input.propertyId,
      name: input.name,
      url: input.url,
      direction: input.direction,
      room_id: input.roomId,
      is_active: input.isActive,
    })
    .select("id")
    .single();
  if (error) throw mapDbError(error);
  return { id: data.id };
}

export async function updateIcalFeed(
  id: string,
  patch: Partial<Omit<IcalFeedInput, "propertyId">>,
): Promise<void> {
  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["ical_feeds"]["Update"] = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.url !== undefined) payload.url = patch.url;
  if (patch.direction !== undefined) payload.direction = patch.direction;
  if (patch.roomId !== undefined) payload.room_id = patch.roomId;
  if (patch.isActive !== undefined) payload.is_active = patch.isActive;

  const { error } = await supabase
    .from("ical_feeds")
    .update(payload)
    .eq("id", id);
  if (error) throw mapDbError(error);
}

export async function deleteIcalFeed(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ical_feeds").delete().eq("id", id);
  if (error) throw mapDbError(error);
}

/**
 * Resuelve property_id de un feed para autorizar antes de mutate.
 * RLS no permite shortcut sin saber a qué property pertenece la fila.
 */
export async function getIcalFeedPropertyId(
  feedId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ical_feeds")
    .select("property_id")
    .eq("id", feedId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Feed iCal");
  return data.property_id;
}

/**
 * Genera (o regenera) el secret de exportación iCal de la propiedad.
 * Rotarlo invalida URLs previamente compartidas — lo cual es deseado
 * (botón "regenerar" tras compromiso) pero el caller debe avisar al usuario.
 */
export async function regenerateIcalExportSecret(
  propertyId: string,
): Promise<string> {
  const secret = randomBytes(18).toString("base64url");
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ ical_export_secret: secret })
    .eq("id", propertyId);
  if (error) throw mapDbError(error);
  return secret;
}
