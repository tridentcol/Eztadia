import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

/**
 * Cron que expira holds vencidos. Vercel cron pasa
 *   Authorization: Bearer ${CRON_SECRET}
 *
 * Schedule: cada 5 minutos (vercel.json en B17).
 *
 * Idempotente: la SQL function expire_old_holds() solo toca filas con
 * status=active y expires_at <= now(). Si se llama 2 veces seguidas, la
 * segunda devuelve 0.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_secret_not_configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_old_holds");
  if (error) {
    return NextResponse.json({ error: "rpc_failed", message: error.message }, { status: 500 });
  }

  const count = Number(data ?? 0);

  if (count > 0) {
    await logAudit({
      action: "cron.holds_expired",
      resourceType: "booking_hold",
      actorType: "system",
      diff: { expired_count: count },
    });
  }

  return NextResponse.json({ expired: count });
}
