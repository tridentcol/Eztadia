import { z } from "zod";
import { uuid } from "./common";

export const confirmManualPaymentSchema = z.object({
  paymentId: uuid,
  proofUrl: z.string().url().optional(),
});

export type ConfirmManualPaymentInput = z.infer<typeof confirmManualPaymentSchema>;
