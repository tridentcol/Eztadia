import "server-only";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { mapDbError } from "@/lib/errors";

export type WhatsAppConfigInput = {
  propertyId: string;
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string | null; // null = no cambia el token guardado
  isActive: boolean;
};

/**
 * Upsert config de WhatsApp. Si `accessToken` es null y ya existe uno
 * guardado, se preserva (caller solo actualizó otros campos). Si es null
 * y NO existe guardado, el upsert deja access_token_encrypted null
 * (config queda incompleta — la UI ya validó que esto no pase al guardar).
 */
export async function upsertWhatsAppConfig(
  input: WhatsAppConfigInput,
): Promise<void> {
  const supabase = await createClient();

  const payload: {
    property_id: string;
    business_account_id: string;
    phone_number_id: string;
    is_active: boolean;
    access_token_encrypted?: string;
  } = {
    property_id: input.propertyId,
    business_account_id: input.businessAccountId,
    phone_number_id: input.phoneNumberId,
    is_active: input.isActive,
  };
  if (input.accessToken && input.accessToken.length > 0) {
    payload.access_token_encrypted = encrypt(input.accessToken);
  }

  const { error } = await supabase
    .from("whatsapp_configs")
    .upsert(payload, { onConflict: "property_id" });
  if (error) throw mapDbError(error);
}

export async function deleteWhatsAppConfig(propertyId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_configs")
    .delete()
    .eq("property_id", propertyId);
  if (error) throw mapDbError(error);
}
