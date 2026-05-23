/**
 * Helper para mapear el tipo `inet` de PostgreSQL al TS plano.
 *
 * PostgREST devuelve `inet` como `unknown` en la generación de tipos (no
 * existe mapeo nativo). En la práctica, llega como string en la respuesta JSON
 * — pero TypeScript no lo sabe, así que necesitamos un narrow seguro.
 *
 * Usar este helper en lugar de `value as string | null` para que el filtrado
 * runtime quede explícito (y manejar futuro caso donde llegue null o número).
 */
export function inetToString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return null;
}
