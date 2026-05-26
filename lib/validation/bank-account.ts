import { z } from "zod";

export const HOLDER_DOC_TYPES = ["CC", "CE", "NIT"] as const;
export const ACCOUNT_TYPES = ["savings", "checking"] as const;

export type BankAccountHolderDocumentType = (typeof HOLDER_DOC_TYPES)[number];
export type BankAccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABEL: Record<BankAccountType, string> = {
  savings: "Ahorros",
  checking: "Corriente",
};

export const HOLDER_DOC_TYPE_LABEL: Record<BankAccountHolderDocumentType, string> = {
  CC: "CC · Cédula de ciudadanía",
  CE: "CE · Cédula de extranjería",
  NIT: "NIT · Empresa",
};

export const bankAccountInputSchema = z.object({
  holderName: z
    .string()
    .trim()
    .min(2, "El titular es requerido.")
    .max(120, "Máximo 120 caracteres."),
  holderDocumentType: z.enum(HOLDER_DOC_TYPES, {
    required_error: "Selecciona tipo de documento.",
  }),
  holderDocumentNumber: z
    .string()
    .trim()
    .min(5, "Documento muy corto.")
    .max(20, "Documento muy largo.")
    .regex(/^[0-9.\-]+$/, "Solo números, puntos o guiones."),
  bankName: z
    .string()
    .trim()
    .min(2, "Banco requerido.")
    .max(80, "Máximo 80 caracteres."),
  accountType: z.enum(ACCOUNT_TYPES, {
    required_error: "Selecciona tipo de cuenta.",
  }),
  accountNumber: z
    .string()
    .trim()
    .min(4, "Número muy corto.")
    .max(30, "Número muy largo.")
    .regex(/^[0-9 \-]+$/, "Solo números, espacios o guiones."),
  notes: z.string().trim().max(280).optional(),
});

export type BankAccountInput = z.infer<typeof bankAccountInputSchema>;
