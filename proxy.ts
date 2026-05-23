import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

// Proxy en Next 16 SIEMPRE corre en Node.js runtime — no necesita flag.
// La convención reemplaza al middleware.ts de Next 15, que corría en Edge
// y crasheaba con @supabase/ssr (__dirname is not defined).

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match todo excepto:
     *   - _next/static (static files)
     *   - _next/image (image optimization)
     *   - favicon.ico
     *   - assets con extension de imagen
     *   - /api/webhooks/** (no requieren auth de user, validan HMAC)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
