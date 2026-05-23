import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint que Supabase Auth llama tras confirmar email o reset password.
 * Recibe ?code=<one-time> y lo intercambia por una sesion (sets cookies).
 *
 * El parametro `next` indica a donde redirigir tras la confirmacion:
 *   - /onboarding (tras signup confirm)
 *   - /reset-password/confirm (tras reset link)
 *
 * Si llegamos sin `code` valido, mandamos a /login con un flag de error.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?auth_callback_error=missing_code", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?auth_callback_error=invalid_code", url.origin),
    );
  }

  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
