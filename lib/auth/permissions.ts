import "server-only";
import type { Database } from "@/lib/supabase/database.types";

type PropertyRole = Database["public"]["Enums"]["PropertyUserRole"];

/**
 * Matriz de capacidades por rol dentro de una propiedad.
 * Usar como capa TS sobre RLS para enable/disable de UI y guards de actions.
 *
 * Nota: RLS sigue siendo la fuente de verdad. Esta matriz se usa para:
 *   - ocultar botones que el user no va a poder usar (UX)
 *   - early-return en server actions con un error claro
 */

export type Action =
  // Propiedad
  | "property.read"
  | "property.update"
  | "property.delete"
  // Habitaciones
  | "room.read"
  | "room.write"
  // Reservas
  | "booking.read"
  | "booking.create"
  | "booking.update"
  | "booking.cancel"
  | "booking.assignRoom"
  // Pagos
  | "payment.read"
  | "payment.confirm"
  | "payment.refund"
  // Staff
  | "staff.read"
  | "staff.invite"
  | "staff.updateRole"
  | "staff.remove"
  // Integraciones
  | "integration.read"
  | "integration.update"
  // iCal
  | "ical.read"
  | "ical.write"
  // Audit
  | "audit.read";

const MATRIX: Record<Action, PropertyRole[]> = {
  "property.read":      ["owner", "manager", "reception"],
  "property.update":    ["owner"],
  "property.delete":    ["owner"],

  "room.read":          ["owner", "manager", "reception"],
  "room.write":         ["owner", "manager"],

  "booking.read":       ["owner", "manager", "reception"],
  "booking.create":     ["owner", "manager", "reception"],
  "booking.update":     ["owner", "manager", "reception"],
  "booking.cancel":     ["owner", "manager"],
  "booking.assignRoom": ["owner", "manager", "reception"],

  "payment.read":       ["owner", "manager"],
  "payment.confirm":    ["owner", "manager"],
  "payment.refund":     ["owner"],

  "staff.read":         ["owner", "manager", "reception"],
  "staff.invite":       ["owner"],
  "staff.updateRole":   ["owner"],
  "staff.remove":       ["owner"],

  "integration.read":   ["owner"],
  "integration.update": ["owner"],

  "ical.read":          ["owner", "manager", "reception"],
  "ical.write":         ["owner", "manager"],

  "audit.read":         ["owner", "manager"],
};

export function can(action: Action, role: PropertyRole): boolean {
  return MATRIX[action].includes(role);
}
