import { z } from "zod";
import { email, password, fullName, phoneE164 } from "./common";

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Falta tu contrasena."),
  redirectTo: z.string().optional(),
});

export const signUpSchema = z.object({
  fullName,
  email,
  password,
  phone: phoneE164,
});

export const resetRequestSchema = z.object({
  email,
});

export const resetCompleteSchema = z
  .object({
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Las contrasenas no coinciden.",
  });

export const verifyMfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Codigo de 6 digitos."),
});

export type SignInInput        = z.infer<typeof signInSchema>;
export type SignUpInput        = z.infer<typeof signUpSchema>;
export type ResetRequestInput  = z.infer<typeof resetRequestSchema>;
export type ResetCompleteInput = z.infer<typeof resetCompleteSchema>;
export type VerifyMfaInput     = z.infer<typeof verifyMfaSchema>;
