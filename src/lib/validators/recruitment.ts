import { z } from "zod";

export const submitApplicationSchema = z.object({
  universityId: z.string().min(2).max(32),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email(),
  major: z.string().min(1).max(120),
  codingExperience: z.string().min(10).max(2000),
});
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

export const decideApplicationSchema = z.object({
  clubAppId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "WITHDRAWN"]),
  expectedGraduation: z.coerce.date().optional(),
  initialPassword: z.string().min(8).optional(),
});
