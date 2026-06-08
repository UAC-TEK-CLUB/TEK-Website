import { z } from "zod";
import { approvalDecision, entityId } from "@/lib/validators/common";

const labDescriptionFields = {
  description: z.string().min(10).max(2000),
  objective: z.string().min(10).max(2000),
};

export const createLabSchema = z.object({
  labName: z.string().min(2).max(80),
  ...labDescriptionFields,
});

export const submitLabProposalSchema = z.object({
  proposedName: z.string().min(2).max(80),
  ...labDescriptionFields,
});

export const decideLabAppSchema = z.object({
  labAppId: entityId,
  decision: approvalDecision,
});

export const decideProposalSchema = z.object({
  proposalId: entityId,
  decision: approvalDecision,
});

/** President assigns up to two distinct lab leaders (member IDs). Empty = clear all. */
export const setLabLeadersSchema = z
  .object({
    labId: entityId,
    leaderMemberIds: z.array(entityId).max(2),
  })
  .transform((d) => {
    const unique = [...new Set(d.leaderMemberIds.map((id) => id.trim()))];
    return { labId: d.labId, leaderMemberIds: unique };
  });
