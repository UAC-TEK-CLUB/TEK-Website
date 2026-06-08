import { z } from "zod";
import { confirmOtpSchema, entityId } from "@/lib/validators/common";

export const studentIdRecoverySchema = z.string().trim().min(2).max(32);

export const requestFindUsernameSchema = z.object({
  universityId: studentIdRecoverySchema,
});

export const confirmFindUsernameSchema = confirmOtpSchema;

export const requestPasswordResetSchema = z.object({
  username: z.string().trim().min(1).max(24),
  universityId: studentIdRecoverySchema,
});

export const confirmPasswordResetSchema = confirmOtpSchema;

export const completePasswordTicketSchema = z.object({
  token: entityId,
  password: z.string().min(1).max(128),
  confirmPassword: z.string().min(1).max(128),
});
