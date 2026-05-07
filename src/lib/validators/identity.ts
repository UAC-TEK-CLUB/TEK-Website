import { z } from "zod";

export const registerMemberSchema = z.object({
  universityId: z.string().min(2).max(32),
  email: z.string().email(),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  password: z.string().min(8).max(128),
  expectedGraduation: z.coerce.date(),
});
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  expectedGraduation: z.coerce.date().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const assignMentorSchema = z.object({
  menteeId: z.string().min(1),
  mentorId: z.string().min(1).nullable(),
});

export const promoteOfficerSchema = z.object({
  memberId: z.string().min(1),
  adminAccessLevel: z.coerce.number().int().min(1).max(5),
});

export const setMembershipStatusSchema = z.object({
  memberId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI", "SUSPENDED"]),
});
