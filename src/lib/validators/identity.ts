import { z } from "zod";

export const completeRegistrationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  expectedGraduation: z.coerce.date(),
});
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;

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
  officerRole: z.enum(["PRESIDENT", "SUPERVISOR", "OFFICER"]).default("OFFICER"),
});

export const setOfficerRoleSchema = z.object({
  memberId: z.string().min(1),
  officerRole: z.enum(["PRESIDENT", "SUPERVISOR", "OFFICER"]),
});

export const setMembershipStatusSchema = z.object({
  memberId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI", "SUSPENDED"]),
});
