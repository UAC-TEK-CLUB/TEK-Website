import { z } from "zod";
import { applicationDecision, emailField, entityId, personName } from "@/lib/validators/common";

export const submitApplicationSchema = z.object({
  universityId: z.string().min(2).max(32),
  firstName: personName,
  lastName: personName,
  email: emailField,
  major: z.string().min(1).max(120),
  codingExperience: z
    .string()
    .trim()
    .min(1, "Please describe your coding experience (or write “None” if you are just starting).")
    .max(2000),
});
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

export const decideApplicationSchema = z.object({
  clubAppId: entityId,
  decision: applicationDecision,
});

export const resendAccountSetupSchema = z.object({
  clubAppId: entityId,
});
