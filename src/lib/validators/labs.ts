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

/** President assigns up to two distinct lab leaders (member IDs). Empty = clear all. */
export const setLabLeadersSchema = z
  .object({
    labId: z.string().min(1),
    leaderMemberIds: z.array(z.string().min(1)).max(2),
  })
  .transform((d) => {
    const unique = [...new Set(d.leaderMemberIds.map((id) => id.trim()))];
    return { labId: d.labId, leaderMemberIds: unique };
  });
