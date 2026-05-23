import "dotenv/config";

// Carga .env.local manualmente (vitest no lo hace automatico como Next).
import { config } from "dotenv";
import path from "node:path";
config({ path: path.resolve(__dirname, "..", ".env.local"), override: true });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Tests requieren NEXT_PUBLIC_SUPABASE_URL en .env.local");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Tests requieren SUPABASE_SERVICE_ROLE_KEY en .env.local");
}
