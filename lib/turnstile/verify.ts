import "server-only";
import { headers } from "next/headers";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifica un token de Cloudflare Turnstile server-side.
 *
 * Graceful degradation:
 *   - Si TURNSTILE_SECRET_KEY no esta configurada (dev local sin keys),
 *     devuelve { ok: true } sin contactar Cloudflare. Esto permite que
 *     el resto del codigo (forms, server actions) funcione en local sin
 *     bloquear el flow.
 *
 *   - En produccion, TURNSTILE_SECRET_KEY debe estar configurada y un
 *     token vacio devuelve { ok: false }.
 *
 * Para forzar el verify en todo entorno (p.ej. tests de seguridad), setea
 * TURNSTILE_REQUIRED=true.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const required = process.env.TURNSTILE_REQUIRED === "true";

  if (!secret) {
    if (required) return { ok: false, reason: "missing_secret_key" };
    return { ok: true };
  }

  if (!token) return { ok: false, reason: "missing_token" };

  let remoteIp: string | null = null;
  try {
    const h = await headers();
    remoteIp =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;
  } catch {
    // headers() solo disponible en request context; fuera de eso ignoramos.
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      // timeout corto — el form no puede colgarse esperando a Cloudflare
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (data.success) return { ok: true };
    return {
      ok: false,
      reason: (data["error-codes"]?.[0] as string) ?? "verify_failed",
    };
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "network_error" };
  }
}
