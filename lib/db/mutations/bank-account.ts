import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";
import type { BankAccountInput } from "@/lib/validation/bank-account";

type BankAccountRow = Database["public"]["Tables"]["bank_accounts"]["Row"];

/**
 * Upsert (insert si no existe, update si existe) los datos bancarios de una
 * property. RLS auth: owner/manager. UNIQUE(property_id) garantiza 1:1.
 */
export async function upsertBankAccount(
  propertyId: string,
  input: BankAccountInput,
): Promise<BankAccountRow> {
  const supabase = await createClient();
  const payload = {
    property_id: propertyId,
    holder_name: input.holderName,
    holder_document_type: input.holderDocumentType,
    holder_document_number: input.holderDocumentNumber,
    bank_name: input.bankName,
    account_type: input.accountType,
    account_number: input.accountNumber,
    notes: input.notes ?? null,
  };
  const { data, error } = await supabase
    .from("bank_accounts")
    .upsert(payload, { onConflict: "property_id" })
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Cuenta bancaria");
  return data;
}

/**
 * Elimina los datos bancarios de una property. Tras esto, el flow publico
 * de pago desactiva la opcion "Transferencia".
 */
export async function deleteBankAccount(propertyId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("property_id", propertyId);
  if (error) throw mapDbError(error);
}
