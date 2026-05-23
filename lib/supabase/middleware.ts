import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/**
 * Helper que el middleware.ts del root llama en cada request.
 *
 * Hace dos cosas:
 *   1. Refresca el access_token de Supabase si esta proximo a expirar y
 *      reescribe las cookies en la response (cliente browser las ve).
 *   2. Aplica route guards:
 *        - /dashboard/** y /admin/** requieren sesion → redirect a /login
 *        - /login, /signup, /reset-password con sesion activa → redirect /dashboard
 *
 * Usa getSession() (lee cookies, no hace fetch) en vez de getUser() (valida
 * JWT contra Supabase) para ser robusto en Edge runtime. El JWT lo validan
 * las paginas server-side; el middleware solo decide a donde redirigir.
 *
 * Wrap defensivo: cualquier error inesperado deja pasar la request sin
 * aplicar guards. Las paginas server-side reaplicaran auth via
 * requirePropertyRole / requireSuperAdmin.
 */
export async function updateSession(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      // Sin env vars no podemos validar — dejar pasar.
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    const pathname = request.nextUrl.pathname;
    const isProtected =
      pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    const isAuthPage =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/reset-password" ||
      pathname.startsWith("/reset-password/");

    if (isProtected && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthPage && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.searchParams.delete("redirect");
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch {
    // Edge runtime puede fallar por motivos diversos (cookie corrupta,
    // network glitch). No bloqueamos al usuario — las paginas server-side
    // aplican auth de nuevo.
    return NextResponse.next({ request });
  }
}
