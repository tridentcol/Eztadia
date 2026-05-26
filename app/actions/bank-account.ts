"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePropertyRole } from "@/lib/auth/session";
import {
  upsertBankAccount,
  deleteBankAccount,
} from "@/lib/db/mutations/bank-account";
import { bankAccountInputSchema } from "@/lib/validation/bank-account";
import { uuid } from "@/lib/validation/common";
import { logAudit } from "@/lib/audit";
import { run } from "./_helpers";

const saveSchema = z.object({
  propertyId: uuid,
  data: bankAccountInputSchema,
});

export async function upsertBankAccountAction(raw: unknown) {
  return run(saveSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");
    await upsertBankAccount(input.propertyId, input.data);
    await logAudit({
      action: "bank_account.saved",
      resourceType: "bank_account",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
      diff: {
        bank: input.data.bankName,
        accountType: input.data.accountType,
        holder: input.data.holderName,
      },
    });
    revalidatePath("/dashboard/property-settings");
    return { ok: true as const };
  });
}

const removeSchema = z.object({ propertyId: uuid });

export async function deleteBankAccountAction(raw: unknown) {
  return run(removeSchema, raw, async (input) => {
    await requirePropertyRole(input.propertyId, "manager");
    await deleteBankAccount(input.propertyId);
    await logAudit({
      action: "bank_account.removed",
      resourceType: "bank_account",
      resourceId: input.propertyId,
      propertyId: input.propertyId,
    });
    revalidatePath("/dashboard/property-settings");
    return { ok: true as const };
  });
}
