import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

/**
 * Carga una propiedad por id. RLS aplica:
 *  - users autenticados ven solo propiedades a las que pertenecen
 *  - anon ve propiedades con is_active=true (para flow publico /p/[slug])
 */
export async function getProperty(id: string): Promise<PropertyRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Propiedad");
  return data;
}

/**
 * Carga una propiedad por slug (URL publica /p/[slug]).
 * RLS permite anon SELECT si is_active=true.
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Propiedad");
  return data;
}

/**
 * Lista propiedades del user autenticado (via RLS / property_users).
 */
export async function listMyProperties(): Promise<PropertyRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw mapDbError(error);
  return data ?? [];
}
