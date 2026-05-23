import { z } from "zod";

export const SETTINGS_TABS = [
  { key: "general", label: "General" },
  { key: "identity", label: "Identidad" },
  { key: "photos", label: "Fotos" },
  { key: "amenities", label: "Amenities" },
  { key: "policies", label: "Políticas" },
  { key: "schedules", label: "Horarios" },
  { key: "fiscal", label: "Domicilio fiscal" },
  { key: "advanced", label: "Avanzado" },
] as const;

export type SettingsTabKey = (typeof SETTINGS_TABS)[number]["key"];

/* ─── GENERAL ─── */
export const generalSchema = z.object({
  name: z.string().min(2, "Tu propiedad necesita un nombre."),
  type: z.enum(["hotel", "building", "complex"]),
  address: z.string().min(3, "Dirección requerida."),
  city: z.string().min(2),
  country: z.string().min(2),
  timezone: z.string().min(2),
});
export type GeneralValues = z.infer<typeof generalSchema>;

/* ─── IDENTITY ─── */
export const identitySchema = z.object({
  logoUrl: z.string().optional(),
  descriptionEs: z.string().max(2000),
  descriptionEn: z.string().max(2000),
});
export type IdentityValues = z.infer<typeof identitySchema>;

/* ─── AMENITIES ─── */
export const AMENITY_GROUPS = [
  {
    key: "connectivity",
    label: "Conectividad",
    items: [
      { key: "wifi-fiber", label: "Wifi fibra" },
      { key: "wifi", label: "Wifi" },
      { key: "workspace", label: "Workspace" },
      { key: "printer", label: "Impresora" },
    ],
  },
  {
    key: "comfort",
    label: "Confort",
    items: [
      { key: "ac", label: "A/C" },
      { key: "heating", label: "Calefacción" },
      { key: "fan", label: "Ventilador" },
      { key: "mosquito", label: "Mosquitero" },
    ],
  },
  {
    key: "outdoors",
    label: "Exteriores",
    items: [
      { key: "pool", label: "Piscina" },
      { key: "jacuzzi", label: "Jacuzzi" },
      { key: "patio", label: "Patio" },
      { key: "terrace", label: "Terraza" },
      { key: "garden", label: "Jardín" },
      { key: "hammocks", label: "Hamacas" },
    ],
  },
  {
    key: "food",
    label: "Comida",
    items: [
      { key: "breakfast", label: "Desayuno incluido" },
      { key: "kitchen", label: "Cocina equipada" },
      { key: "coffee", label: "Cafetera" },
      { key: "bar", label: "Bar" },
    ],
  },
  {
    key: "services",
    label: "Servicios",
    items: [
      { key: "reception-24", label: "Recepción 24h" },
      { key: "room-service", label: "Servicio a habitación" },
      { key: "laundry", label: "Lavandería" },
      { key: "daily-cleaning", label: "Limpieza diaria" },
    ],
  },
  {
    key: "accessibility",
    label: "Accesibilidad",
    items: [
      { key: "wheelchair", label: "Acceso silla de ruedas" },
      { key: "ground-floor", label: "Habitaciones planta baja" },
      { key: "elevator", label: "Ascensor" },
    ],
  },
] as const;

export const amenitiesSchema = z.object({
  selected: z.array(z.string()),
});
export type AmenitiesValues = z.infer<typeof amenitiesSchema>;

/* ─── POLICIES ─── */
export const policiesSchema = z
  .object({
    cancellation: z.enum(["flexible", "moderate", "strict"]),
    pets: z.boolean(),
    petsFee: z.number().nonnegative().optional(),
    petsRules: z.string().max(280).optional(),
    children: z.boolean(),
    childrenFreeAge: z.number().int().min(0).max(17).optional(),
    smoking: z.boolean(),
    smokingAreas: z.string().max(280).optional(),
    events: z.boolean(),
  })
  .refine((v) => !v.pets || (v.petsFee !== undefined && v.petsFee >= 0), {
    path: ["petsFee"],
    message: "Cargo requerido si aceptas mascotas.",
  });
export type PoliciesValues = z.infer<typeof policiesSchema>;

/* ─── SCHEDULES ─── */
export const schedulesSchema = z
  .object({
    checkIn: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM."),
    checkOut: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM."),
    earlyCheckIn: z.boolean(),
    lateCheckOut: z.boolean(),
    minStay: z.number().int().min(1).max(30),
    maxStayUnlimited: z.boolean(),
    maxStay: z.number().int().min(1).max(365).optional(),
  })
  .refine((v) => v.maxStayUnlimited || (v.maxStay !== undefined && v.maxStay > 0), {
    path: ["maxStay"],
    message: "Define un máximo o marca sin límite.",
  });
export type SchedulesValues = z.infer<typeof schedulesSchema>;

/* ─── FISCAL ─── */
export const fiscalSchema = z.object({
  legalName: z.string().min(2),
  taxId: z.string().min(3),
  fiscalAddress: z.string().min(3),
  regime: z.enum(["comun", "simplificado", "otro"]),
});
export type FiscalValues = z.infer<typeof fiscalSchema>;

/* ─── ADVANCED ─── */
export const advancedSchema = z.object({
  showNightlyPrice: z.boolean(),
  instantBookings: z.boolean(),
  requireIdDocument: z.boolean(),
  holdTtlPseMinutes: z.number().int().min(5).max(60),
  holdTtlManualHours: z.number().int().min(1).max(72),
});
export type AdvancedValues = z.infer<typeof advancedSchema>;

/* ─── PROPERTY SETTINGS SHAPE ─── */

export type PropertySettings = {
  general: GeneralValues;
  identity: IdentityValues;
  amenities: AmenitiesValues;
  policies: PoliciesValues;
  schedules: SchedulesValues;
  fiscal: FiscalValues;
  advanced: AdvancedValues;
  photos: { id: string; url: string; alt: string; path?: string }[];
};
