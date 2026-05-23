"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para uso en el browser (Client Components, event handlers,
 * hooks). Usa la anon key publica — RLS filtra el acceso.
 *
 * No usar en Server Components ni Route Handlers — alli va el client de
 * server.ts que maneja cookies via next/headers.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
