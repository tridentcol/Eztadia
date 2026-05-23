"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile/verify";

/**
 * Server actions de autenticacion.
 *
 * Patron: cada accion recibe un objeto plano (lo envia el form client),
 * lo valida con Zod, ejecuta la operacion contra Supabase Auth, y retorna
 * { ok: true } o { ok: false, error: string }. Si todo bien y debe redirigir,
 * llama redirect() (que throwa NEXT_REDIRECT — los forms NO atrapan esto).
 *
 * Mensajes de error en espanol — el client los renderea tal cual.
 */

// ─── Sign in ────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email("Email invalido."),
  password: z.string().min(1, "Falta tu contrasena."),
  redirectTo: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInAction(
  input: z.infer<typeof signInSchema>,
): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const ts = await verifyTurnstile(parsed.data.turnstileToken);
  if (!ts.ok) {
    console.error(`turnstile_failed action=signIn reason=${ts.reason ?? "unknown"}`);
    return { ok: false, error: "No pudimos verificar que no eres un bot. Recarga la pagina." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: "Esa combinacion no funciono. Verifica tu email y contrasena." };
  }

  revalidatePath("/", "layout");

  const target = parsed.data.redirectTo && parsed.data.redirectTo.startsWith("/")
    ? parsed.data.redirectTo
    : "/dashboard";
  redirect(target);
}

// ─── Sign up ────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  fullName: z.string().min(3, "Tu nombre completo, por favor."),
  email: z.string().email("Email invalido."),
  password: z
    .string()
    .min(8, "Minimo 8 caracteres.")
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: "Mezcla letras y numeros.",
    }),
  phone: z.string().min(7, "Telefono incompleto."),
  phonePrefix: z.string().default("+57"),
  turnstileToken: z.string().optional(),
});

export type SignUpResult =
  | { ok: true; needsEmailConfirm: boolean }
  | { ok: false; error: string };

export async function signUpAction(
  input: z.infer<typeof signUpSchema>,
): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const ts = await verifyTurnstile(parsed.data.turnstileToken);
  if (!ts.ok) {
    console.error(`turnstile_failed action=signUp reason=${ts.reason ?? "unknown"}`);
    return { ok: false, error: "No pudimos verificar que no eres un bot. Recarga la pagina." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fullPhone = parsed.data.phonePrefix + parsed.data.phone.replace(/\s+/g, "");

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: {
        full_name: parsed.data.fullName,
        phone: fullPhone,
      },
    },
  });

  if (error) {
    console.error(`signup_failed status=${error.status ?? "?"} code=${error.code ?? "?"} message=${error.message}`);
    const msg = error.message.toLowerCase();
    if (msg.includes("registered")) {
      return { ok: false, error: "Ya hay una cuenta con ese email. Intenta iniciar sesion." };
    }
    if (msg.includes("invalid") && msg.includes("email")) {
      return { ok: false, error: "Ese email no es valido. Revisa el dominio (ej. gmail.com)." };
    }
    if (msg.includes("password")) {
      return { ok: false, error: "Esa contrasena no cumple los requisitos." };
    }
    return { ok: false, error: "No pudimos crear tu cuenta. Intenta de nuevo." };
  }

  // Si email confirmation esta deshabilitada, hay sesion inmediata.
  const needsEmailConfirm = !data.session;
  return { ok: true, needsEmailConfirm };
}

// ─── Reset password (request) ───────────────────────────────────────────────

const resetRequestSchema = z.object({
  email: z.string().email("Email invalido."),
  turnstileToken: z.string().optional(),
});

export type ResetRequestResult = { ok: true };
// Siempre devolvemos ok=true para no filtrar existencia de cuentas.

export async function resetPasswordRequestAction(
  input: z.infer<typeof resetRequestSchema>,
): Promise<ResetRequestResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: true };

  const ts = await verifyTurnstile(parsed.data.turnstileToken);
  if (!ts.ok) {
    console.error(`turnstile_failed action=resetPasswordRequest reason=${ts.reason ?? "unknown"}`);
    return { ok: true };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/confirm`,
  });

  return { ok: true };
}

// ─── Reset password (set new) ───────────────────────────────────────────────

const resetCompleteSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimo 8 caracteres.")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
        message: "Mezcla letras y numeros.",
      }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Las contrasenas no coinciden.",
  });

export type ResetCompleteResult = { ok: true } | { ok: false; error: string };

export async function resetPasswordCompleteAction(
  input: z.infer<typeof resetCompleteSchema>,
): Promise<ResetCompleteResult> {
  const parsed = resetCompleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();

  // Necesita session activa (el callback de reset la crea automaticamente).
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "El link de recuperacion expiro. Solicita uno nuevo." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: "No pudimos actualizar la contrasena. Intenta de nuevo." };
  }

  return { ok: true };
}

// ─── Sign out ───────────────────────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ─── MFA verify (placeholder hasta Phase B8) ────────────────────────────────
// El flow completo requiere enrolar TOTP en settings personales (Phase D).
// Por ahora solo expongo el handler que validara el code cuando exista factor.

const verifyMfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Codigo de 6 digitos requerido."),
});

export type VerifyMfaResult = { ok: true } | { ok: false; error: string };

export async function verifyMfaAction(
  input: z.infer<typeof verifyMfaSchema>,
): Promise<VerifyMfaResult> {
  const parsed = verifyMfaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Codigo invalido." };
  }

  const supabase = await createClient();
  const factors = await supabase.auth.mfa.listFactors();
  const totp = factors.data?.totp?.[0];

  if (!totp) {
    // No hay factor TOTP enrolado — login normal sin MFA.
    return { ok: true };
  }

  const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
  if (challenge.error) {
    return { ok: false, error: "No pudimos validar el codigo. Intenta de nuevo." };
  }

  const verify = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: challenge.data.id,
    code: parsed.data.code,
  });

  if (verify.error) {
    return { ok: false, error: "Codigo incorrecto." };
  }

  return { ok: true };
}
