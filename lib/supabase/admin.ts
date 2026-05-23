import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente Supabase con service_role key — bypasea RLS.
 *
 * USO LIMITADO. Casos validos:
 *   - Crear holds/bookings desde flow publico /p/[slug] (server actions B7)
 *   - Webhooks Wompi (server-to-server, sin user session)
 *   - Cron jobs (expire_old_holds)
 *   - Sync iCal (inserta external_blocks)
 *   - Admin operations sobre toda la plataforma
 *
 * NUNCA importar este modulo desde Client Components o codigo que se ejecute
 * con permisos de un user end. La key permite leer/escribir cualquier tabla
 * sin restriccion.
 *
 * Devuelve un cliente singleton (no hidrata session — corre como service_role).
 */

let _admin: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
    );
  }

  _admin = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _admin;
}
