/**
 * Clases de error tipadas para el data layer.
 *
 * Cada una expone:
 *   - `code` discriminante (literal string) → ideal para switch en UI.
 *   - `message` orientado a usuario final (espanol).
 *   - `cause` opcional para wrap del error raw (Supabase, Prisma).
 *
 * Convencion: las queries devuelven o el resultado o throwan estas.
 * Server actions del frontend deberian atrapar y mapear a { ok: false, error }.
 */

export type AppErrorCode =
  | "DB_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHENTICATED"
  | "VALIDATION"
  | "CONFLICT"
  | "NO_AVAILABILITY"
  | "RATE_LIMITED";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Error de base de datos.", cause?: unknown) {
    super("DB_ERROR", message, cause);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super("NOT_FOUND", `${resource} no encontrado.`);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tienes permiso para esta accion.") {
    super("FORBIDDEN", message);
  }
}

export class UnauthenticatedError extends AppError {
  constructor() {
    super("UNAUTHENTICATED", "Debes iniciar sesion.");
  }
}

export class ValidationError extends AppError {
  readonly field?: string;
  constructor(message: string, field?: string) {
    super("VALIDATION", message);
    this.field = field;
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con datos existentes.") {
    super("CONFLICT", message);
  }
}

export class NoAvailabilityError extends AppError {
  constructor() {
    super("NO_AVAILABILITY", "No hay disponibilidad en las fechas elegidas.");
  }
}

export class RateLimitedError extends AppError {
  constructor(retryAfterSeconds?: number) {
    super(
      "RATE_LIMITED",
      retryAfterSeconds
        ? `Demasiados intentos. Intenta de nuevo en ${retryAfterSeconds}s.`
        : "Demasiados intentos. Intenta de nuevo en un momento.",
    );
  }
}

/**
 * Mapea un error crudo de PostgREST / Supabase a AppError.
 */
export function mapDbError(err: { code?: string; message?: string } | null | undefined): AppError {
  if (!err) return new DatabaseError();

  // Supabase / PostgREST codes
  switch (err.code) {
    case "PGRST116":
      return new NotFoundError();
    case "P0001":
      // Custom raise from SQL functions (create_booking_hold)
      if (err.message?.includes("NO_AVAILABILITY")) return new NoAvailabilityError();
      if (err.message?.includes("INVALID_DATE_RANGE")) return new ValidationError("Rango de fechas invalido.");
      return new ValidationError(err.message ?? "Datos invalidos.");
    case "23505":
      return new ConflictError("Ya existe un registro con esos datos.");
    case "23503":
      return new ValidationError("Referencia a un registro inexistente.");
    case "42501":
      return new ForbiddenError();
    default:
      return new DatabaseError(err.message ?? "Error de base de datos.", err);
  }
}
