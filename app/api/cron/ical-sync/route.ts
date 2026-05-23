import { NextResponse, type NextRequest } from "next/server";
import { syncAllActiveInbound } from "@/lib/ical/sync";
import { logAudit } from "@/lib/audit";

/**
 * Cron que sincroniza feeds iCal entrantes activos. Vercel cron pasa
 *   Authorization: Bearer ${CRON_SECRET}
 *
 * Schedule: cada 15 minutos (vercel.json).
 *
 * Idempotente: skip de feeds sincronizados en <60s. Errores por feed se
 * registran en ical_feeds.last_sync_error sin tumbar el batch entero.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // segundos — Vercel hobby

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "cron_secret_not_configured" },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await syncAllActiveInbound();

    if (summary.total > 0) {
      await logAudit({
        action: "cron.ical_synced",
        resourceType: "ical_feed",
        actorType: "system",
        diff: {
          total: summary.total,
          succeeded: summary.succeeded,
          failed: summary.failed,
          skipped: summary.skipped,
        },
      });
    }

    return NextResponse.json({
      total: summary.total,
      succeeded: summary.succeeded,
      failed: summary.failed,
      skipped: summary.skipped,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error en sync iCal.";
    return NextResponse.json(
      { error: "sync_failed", message },
      { status: 500 },
    );
  }
}
