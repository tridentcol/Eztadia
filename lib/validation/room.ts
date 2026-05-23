import { z } from "zod";
import { uuid, moneyCents, isoDate } from "./common";

export const createRoomTypeSchema = z.object({
  propertyId: uuid,
  nameEs: z.string().min(2, "Nombre requerido.").max(80),
  nameEn: z.string().max(80).optional(),
  descriptionEs: z.string().max(2000).nullable().optional(),
  basePriceCents: moneyCents,
  capacityAdults: z.number().int().min(1).max(20),
  capacityChildren: z.number().int().min(0).max(20).default(0),
  sizeM2: z.number().int().min(1).max(1000).nullable().optional(),
  bedConfiguration: z.string().max(80).nullable().optional(),
  amenities: z.array(z.string().max(40)).max(40).default([]),
});

export const updateRoomTypeSchema = z.object({
  id: uuid,
  nameEs: z.string().min(2).max(80).optional(),
  nameEn: z.string().max(80).nullable().optional(),
  descriptionEs: z.string().max(2000).nullable().optional(),
  basePriceCents: moneyCents.optional(),
  capacityAdults: z.number().int().min(1).max(20).optional(),
  capacityChildren: z.number().int().min(0).max(20).optional(),
  sizeM2: z.number().int().min(1).max(1000).nullable().optional(),
  bedConfiguration: z.string().max(80).nullable().optional(),
  amenities: z.array(z.string().max(40)).max(40).optional(),
  isActive: z.boolean().optional(),
});

export const createRoomSchema = z.object({
  propertyId: uuid,
  roomTypeId: uuid,
  number: z.string().min(1, "Numero requerido.").max(20),
  floor: z.string().max(20).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateRoomSchema = z.object({
  id: uuid,
  roomTypeId: uuid.optional(),
  number: z.string().min(1).max(20).optional(),
  floor: z.string().max(20).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const seasonalRateSchema = z
  .object({
    roomTypeId: uuid,
    name: z.string().max(80).nullable().optional(),
    startDate: isoDate,
    endDate: isoDate,
    priceCents: moneyCents,
    priority: z.number().int().min(0).max(100).default(0),
  })
  .refine((v) => v.startDate <= v.endDate, {
    path: ["endDate"],
    message: "Fin debe ser >= inicio.",
  });

export const updateSeasonalRateSchema = z
  .object({
    id: uuid,
    name: z.string().max(80).nullable().optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    priceCents: moneyCents.optional(),
    priority: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (v) => !(v.startDate && v.endDate) || v.startDate <= v.endDate,
    { path: ["endDate"], message: "Fin debe ser >= inicio." },
  );

export const deleteSeasonalRateSchema = z.object({ id: uuid });

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateRoomInput     = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput     = z.infer<typeof updateRoomSchema>;
export type SeasonalRateInput        = z.infer<typeof seasonalRateSchema>;
export type UpdateSeasonalRateInput  = z.infer<typeof updateSeasonalRateSchema>;
export type DeleteSeasonalRateInput  = z.infer<typeof deleteSeasonalRateSchema>;
