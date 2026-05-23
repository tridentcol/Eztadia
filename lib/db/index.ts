import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton (servidor only).
 *
 * Cuando usar Prisma vs Supabase server client:
 *   - **Supabase server client (`lib/supabase/server.ts`)** — DEFAULT para
 *     queries y mutaciones que se ejecutan con auth de un user. RLS aplica.
 *   - **Prisma (este modulo)** — solo en codigo que ya garantiza autorizacion
 *     fuera de banda (server actions admin, cron jobs, webhooks server-to-server
 *     o batch operations) y necesita transactions/relations complejas.
 *
 * Prisma conecta via DATABASE_URL → user `postgres.<ref>` que tiene rol con
 * BYPASS RLS. NO lo expongas a codigo de user end sin checks de permisos
 * explicitos en TypeScript (`requireProperty()`, `can()` en B9).
 */

declare global {
  var __eztadia_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__eztadia_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__eztadia_prisma__ = prisma;
}
