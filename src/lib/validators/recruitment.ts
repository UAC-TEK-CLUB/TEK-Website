import { z } from "zod";

export const submitApplicationSchema = z.object({
  universityId: z.string().min(2).max(32),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  major: z.string().min(1).max(120),
  codingExperience: z
    .string()
    .trim()
    .min(1, "Please describe your coding experience (or write “None” if you are just starting).")
    .max(2000),
});
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

export const decideApplicationSchema = z.object({
  clubAppId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "WITHDRAWN"]),
});

export const resendAccountSetupSchema = z.object({
  clubAppId: z.string().min(1),
});
