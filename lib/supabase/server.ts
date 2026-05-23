import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Hidrata la session desde cookies (refresh automatico via middleware.ts).
 *
 * RLS aplica como rol `authenticated` cuando hay sesion, sino como `anon`.
 * Para bypass controlado (cron, webhooks publicos) usa lib/supabase/admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component sin permiso de set-cookie.
            // Es seguro ignorar — el middleware refresca el token.
          }
        },
      },
    },
  );
}
