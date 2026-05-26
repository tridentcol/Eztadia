import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

export type BankAccountRow = Database["public"]["Tables"]["bank_accounts"]["Row"];

/**
 * Devuelve la cuenta bancaria de una property (o null si el owner no
 * la configuro). RLS auth: member del property.
 */
export async function getBankAccountByPropertyId(
  propertyId: string,
): Promise<BankAccountRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
}

/**
 * Lee la cuenta bancaria por slug publico (para flow guest). RLS anon
 * permite SELECT cuando la property is_active=true; si no existe la
 * cuenta o la property esta desactivada, retorna null.
 */
export async function getPublicBankAccountBySlug(
  slug: string,
): Promise<BankAccountRow | null> {
  const supabase = await createClient();
  const { data: prop, error: propErr } = await supabase
    .from("properties")
    .select("id, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (propErr) throw mapDbError(propErr);
  if (!prop) return null;

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("property_id", prop.id)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
}
