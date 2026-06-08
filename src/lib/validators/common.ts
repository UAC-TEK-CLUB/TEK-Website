import { z } from "zod";

export const entityId = z.string().min(1);

export const personName = z.string().min(1).max(60);

export const emailField = z.string().email();

export const approvalDecision = z.enum(["APPROVED", "REJECTED"]);

export const applicationDecision = z.enum(["APPROVED", "REJECTED", "WITHDRAWN"]);

export const officerRoleEnum = z.enum(["PRESIDENT", "SUPERVISOR", "LEADER"]);

export const confirmOtpSchema = z.object({
  challengeId: entityId,
  code: z.string().min(1).max(32),
});

const imageUrlOrPathRefine = (val: string) =>
  /^https?:\/\//i.test(val) || val.startsWith("/");

export const imageUrlOrPath = z
  .string()
  .min(1)
  .refine(imageUrlOrPathRefine, "Enter a valid image URL or upload a file.");
