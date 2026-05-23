import { z } from "zod";
import { uuid, email, fullName, phoneE164 } from "./common";

const propertyUserRole = z.enum(["owner", "manager", "reception"]);

export const inviteStaffSchema = z.object({
  propertyId: uuid,
  email,
  role: propertyUserRole,
});

export const updateStaffRoleSchema = z.object({
  propertyUserId: uuid,
  role: propertyUserRole,
});

export const removeStaffSchema = z.object({
  propertyUserId: uuid,
});

export const updateProfileSchema = z.object({
  fullName: fullName.optional(),
  phone: phoneE164.optional().nullable(),
  locale: z.enum(["es", "en"]).optional(),
});

export type InviteStaffInput        = z.infer<typeof inviteStaffSchema>;
export type UpdateStaffRoleInput    = z.infer<typeof updateStaffRoleSchema>;
export type RemoveStaffInput        = z.infer<typeof removeStaffSchema>;
export type UpdateProfileInput      = z.infer<typeof updateProfileSchema>;
