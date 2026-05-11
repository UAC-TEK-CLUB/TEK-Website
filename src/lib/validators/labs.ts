import { z } from "zod";

export const createLabSchema = z.object({
  labName: z.string().min(2).max(80),
  description: z.string().min(10).max(2000),
  objective: z.string().min(10).max(2000),
});

export const submitLabProposalSchema = z.object({
  proposedName: z.string().min(2).max(80),
  description: z.string().min(10).max(2000),
  objective: z.string().min(10).max(2000),
});

export const decideLabAppSchema = z.object({
  labAppId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export const decideProposalSchema = z.object({
  proposalId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export const setLabLeaderSchema = z
  .object({
    labId: z.string().min(1),
    leaderMemberId: z.union([z.string().min(1), z.null()]).optional(),
  })
  .transform((d) => ({
    labId: d.labId,
    leaderMemberId:
      d.leaderMemberId == null || String(d.leaderMemberId).trim() === ""
        ? null
        : String(d.leaderMemberId).trim(),
  }));
