import { z } from "zod";

export const studentIdRecoverySchema = z.string().trim().min(2).max(32);

export const requestFindUsernameSchema = z.object({
  universityId: studentIdRecoverySchema,
});

export const confirmFindUsernameSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().min(1).max(32),
});

export const requestPasswordResetSchema = z.object({
  username: z.string().trim().min(1).max(24),
  universityId: studentIdRecoverySchema,
});

export const confirmPasswordResetSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().min(1).max(32),
});

export const completePasswordTicketSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(1).max(128),
  confirmPassword: z.string().min(1).max(128),
});
