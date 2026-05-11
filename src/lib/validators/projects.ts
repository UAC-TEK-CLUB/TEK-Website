import { z } from "zod";

export const upsertLeaderProjectSchema = z.object({
  labId: z.string().min(1),
  title: z.string().min(2).max(120),
  description: z.string().min(20).max(3000),
  photoUrl: z.string().url(),
});

export const deleteLeaderProjectSchema = z.object({
  projectId: z.string().min(1),
});
