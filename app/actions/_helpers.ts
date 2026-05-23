import "server-only";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "@/lib/errors";

/**
 * Resultado canonico de una server action.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; field?: string };

/**
 * Wrap una accion con Zod + try/catch comun.
 * Convierte AppError a { ok: false, error, code }.
 */
export async function run<T, S extends ZodSchema>(
  schema: S,
  raw: unknown,
  fn: (input: ReturnType<S["parse"]>) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const input = schema.parse(raw);
    const data = await fn(input);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      return {
        ok: false,
        error: first?.message ?? "Datos invalidos.",
        code: "VALIDATION",
        field: first?.path.join(".") || undefined,
      };
    }
    if (err instanceof AppError) {
      return { ok: false, error: err.message, code: err.code };
    }
    if (process.env.NODE_ENV !== "production") {
      // Solo log en dev — no spam logs de prod con stacks completos.
      console.error("[action] unexpected:", err);
    }
    return { ok: false, error: "Algo salio mal. Intenta de nuevo." };
  }
}
