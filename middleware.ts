import { NextResponse, type NextRequest } from "next/server";

// TEMPORAL (sesion 8 debug): middleware NO-OP.
// updateSession() del supabase/ssr está fallando en Edge runtime.
// Las paginas server-side re-aplican auth via requirePropertyRole / requireSuperAdmin,
// asi que NO hay rutas sin proteccion — solo perdemos el redirect automatico
// del unauth user → /login (en su lugar veria un 403/forbidden de la pagina).
//
// Restaurar `updateSession` cuando se diagnostique el error de runtime.

export function middleware(_request: NextRequest) {
  return NextResponse.next();
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
