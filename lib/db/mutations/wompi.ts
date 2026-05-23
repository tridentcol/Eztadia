import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, decrypt } from "@/lib/crypto";
import { mapDbError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type WompiConfigRow = Database["public"]["Tables"]["wompi_configs"]["Row"];

export type WompiConfigInput = {
  propertyId: string;
  publicKey: string;
  privateKey: string;
  eventsSecret: string;
  isTestMode: boolean;
};

export async function upsertWompiConfig(input: WompiConfigInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("wompi_configs").upsert(
    {
      property_id: input.propertyId,
      public_key: input.publicKey,
      private_key_encrypted: encrypt(input.privateKey),
      events_secret_encrypted: encrypt(input.eventsSecret),
      is_test_mode: input.isTestMode,
      // Al guardar credenciales asumimos que el owner las quiere activas. El
      // toggle "pausar pagos" se hace por separado con setWompiActive().
      is_active: true,
    },
    { onConflict: "property_id" },
  );
  if (error) throw mapDbError(error);
}

export async function setWompiActive(
  propertyId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wompi_configs")
    .update({ is_active: isActive })
    .eq("property_id", propertyId);
  if (error) throw mapDbError(error);
}

export async function deleteWompiConfig(propertyId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wompi_configs")
    .delete()
    .eq("property_id", propertyId);
  if (error) throw mapDbError(error);
}

/**
 * Carga config y descifra credenciales para uso server-side (route handler que
 * crea payment_link). Usa admin client porque el flow publico (anon) no tiene
 * acceso a wompi_configs por RLS.
 */
export async function loadWompiCredsForProperty(propertyId: string): Promise<{
  publicKey: string;
  privateKey: string;
  isTestMode: boolean;
} | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wompi_configs")
    .select("public_key, private_key_encrypted, is_test_mode, is_active")
    .eq("property_id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data || !data.public_key || !data.private_key_encrypted) {
    return null;
  }
  // is_active=false → owner pauseo pagos. No emitir nuevos payment links.
  // (Los webhooks de pagos pre-existentes siguen procesándose; eso usa
  // events_secret, no estas credenciales.)
  if (!data.is_active) return null;
  return {
    publicKey: data.public_key,
    privateKey: decrypt(data.private_key_encrypted),
    isTestMode: data.is_test_mode,
  };
}

/**
 * Carga config publica (sin descifrar private) para mostrar en la UI.
 * Aqui usamos el client autenticado (RLS asegura que solo members ven).
 */
export async function getWompiConfigForUI(
  propertyId: string,
): Promise<
  | (Pick<WompiConfigRow, "public_key" | "is_test_mode" | "is_active"> & {
      hasPrivateKey: boolean;
      hasEventsSecret: boolean;
    })
  | null
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wompi_configs")
    .select(
      "public_key, private_key_encrypted, events_secret_encrypted, is_test_mode, is_active",
    )
    .eq("property_id", propertyId)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) return null;
  return {
    public_key: data.public_key,
    is_test_mode: data.is_test_mode,
    is_active: data.is_active,
    hasPrivateKey: !!data.private_key_encrypted,
    hasEventsSecret: !!data.events_secret_encrypted,
  };
}
