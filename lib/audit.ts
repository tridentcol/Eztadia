import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import type { Database } from "@/lib/supabase/database.types";

type ActorType = Database["public"]["Enums"]["AuditActorType"];

/**
 * Inserta una fila en audit_logs. Usa admin client (los inserts requieren
 * bypass de RLS — no exponemos write public a esta tabla).
 *
 * Diff convencion: { before: {...}, after: {...} } o { input: {...} }.
 */
export async function logAudit(args: {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  propertyId?: string | null;
  diff?: Record<string, unknown> | null;
  actorType?: ActorType;
  actorId?: string | null;
}): Promise<void> {
  const admin = createAdminClient();

  let actorId = args.actorId ?? null;
  if (!actorId && (args.actorType ?? "user") === "user") {
    try {
      const user = await getCurrentUser();
      actorId = user?.id ?? null;
    } catch {
      // sin sesion (e.g. webhook) — actor_id queda null
    }
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") ?? null;

  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId,
    actor_type: args.actorType ?? "user",
    action: args.action,
    resource_type: args.resourceType,
    resource_id: args.resourceId ?? null,
    property_id: args.propertyId ?? null,
    diff: (args.diff ?? null) as Database["public"]["Tables"]["audit_logs"]["Insert"]["diff"],
    ip,
    user_agent: userAgent,
  });

  // No tiramos — logging no debe romper la accion principal.
  if (error && process.env.NODE_ENV !== "production") {
    console.error("[audit] failed to insert:", error.message);
  }
}

/**
 * Helper especifico para login events (tabla separada de audit_logs).
 */
export async function logLoginEvent(args: {
  userId: string | null;
  eventType: Database["public"]["Enums"]["LoginEventType"];
  country?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") ?? null;

  const { error } = await admin.from("login_events").insert({
    user_id: args.userId,
    event_type: args.eventType,
    country: args.country ?? null,
    ip,
    user_agent: userAgent,
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.error("[login_event] failed:", error.message);
  }
}
