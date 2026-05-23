import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type WhatsAppConfigRow = Database["public"]["Tables"]["whatsapp_configs"]["Row"];
type WhatsAppMessageRow = Database["public"]["Tables"]["whatsapp_messages"]["Row"];
type IcalFeedRow = Database["public"]["Tables"]["ical_feeds"]["Row"];

/**
 * Config de WhatsApp para la UI — sin descifrar access_token, solo
 * señalando si existe. RLS: solo owner accede.
 */
export type WhatsAppConfigUI = {
  businessAccountId: string | null;
  phoneNumberId: string | null;
  hasAccessToken: boolean;
  isActive: boolean;
};

export async function getWhatsAppConfigForUI(
  propertyId: string,
): Promise<WhatsAppConfigUI | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_configs")
    .select("business_account_id, phone_number_id, access_token_encrypted, is_active")
    .eq("property_id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) return null;
  return {
    businessAccountId: data.business_account_id,
    phoneNumberId: data.phone_number_id,
    hasAccessToken: !!data.access_token_encrypted,
    isActive: data.is_active,
  };
}

export type WhatsAppMessageItem = Pick<
  WhatsAppMessageRow,
  "id" | "direction" | "status" | "from_phone" | "to_phone" |
  "body" | "template_name" | "error" | "booking_id" | "created_at"
>;

export async function listRecentWhatsAppMessages(
  propertyId: string,
  limit = 20,
): Promise<WhatsAppMessageItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select(
      "id, direction, status, from_phone, to_phone, body, template_name, error, booking_id, created_at",
    )
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw mapDbError(error);
  return data ?? [];
}

export type IcalFeedView = Pick<
  IcalFeedRow,
  "id" | "name" | "url" | "direction" | "is_active" |
  "last_synced_at" | "last_sync_error" | "room_id" | "created_at"
> & {
  room: { id: string; number: string } | null;
};

export async function listIcalFeeds(propertyId: string): Promise<IcalFeedView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ical_feeds")
    .select(
      `id, name, url, direction, is_active, last_synced_at, last_sync_error,
       room_id, created_at, room:rooms(id, number)`,
    )
    .eq("property_id", propertyId)
    .order("direction", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw mapDbError(error);

  type Row = Omit<IcalFeedView, "room"> & {
    room: { id: string; number: string } | null;
  };
  return (data ?? []) as unknown as Row[];
}

/**
 * Resuelve el secret de exportación iCal de la propiedad para construir la
 * URL pública. Si todavía no se generó, devuelve null (la UI ofrece generar).
 */
export async function getPropertyIcalSecret(
  propertyId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("ical_export_secret")
    .eq("id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data?.ical_export_secret ?? null;
}

export type WhatsAppMessageStats = {
  totalLast30d: number;
  outboundLast30d: number;
  failedLast30d: number;
};

export async function getWhatsAppMessageStats(
  propertyId: string,
): Promise<WhatsAppMessageStats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [total, outbound, failed] = await Promise.all([
    supabase
      .from("whatsapp_messages")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .gte("created_at", since),
    supabase
      .from("whatsapp_messages")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .eq("direction", "outbound")
      .gte("created_at", since),
    supabase
      .from("whatsapp_messages")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId)
      .eq("status", "failed")
      .gte("created_at", since),
  ]);

  return {
    totalLast30d: total.count ?? 0,
    outboundLast30d: outbound.count ?? 0,
    failedLast30d: failed.count ?? 0,
  };
}

export type IcalFeedStats = {
  inboundCount: number;
  outboundCount: number;
  externalBlocks: number;
};

export async function getIcalStats(propertyId: string): Promise<IcalFeedStats> {
  const supabase = await createClient();
  const [feedsR, blocksR] = await Promise.all([
    supabase
      .from("ical_feeds")
      .select("direction")
      .eq("property_id", propertyId),
    supabase
      .from("external_blocks")
      .select("*", { count: "exact", head: true })
      .eq("property_id", propertyId),
  ]);
  if (feedsR.error) throw mapDbError(feedsR.error);
  if (blocksR.error) throw mapDbError(blocksR.error);

  let inbound = 0;
  let outbound = 0;
  for (const f of feedsR.data ?? []) {
    if (f.direction === "inbound") inbound++;
    else if (f.direction === "outbound") outbound++;
  }
  return {
    inboundCount: inbound,
    outboundCount: outbound,
    externalBlocks: blocksR.count ?? 0,
  };
}
