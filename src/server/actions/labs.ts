"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMember, requireOfficer } from "@/lib/permissions";
import {
  createLabSchema,
  decideLabAppSchema,
  decideProposalSchema,
  submitLabProposalSchema,
} from "@/lib/validators/labs";

export async function createLab(raw: unknown) {
  await requireOfficer(2);
  const data = createLabSchema.parse(raw);
  const lab = await prisma.lab.create({ data });
  revalidatePath("/labs");
  revalidatePath("/admin/labs");
  return lab;
}

export async function applyToLab(labId: string) {
  const me = await requireMember();
  const application = await prisma.labApplication.upsert({
    where: { memberId_labId: { memberId: me.memberId, labId } },
    update: { status: "PENDING" },
    create: { memberId: me.memberId, labId, status: "PENDING" },
  });
  revalidatePath("/labs");
  return application;
}

export async function decideLabApplication(raw: unknown) {
  await requireOfficer(1);
  const data = decideLabAppSchema.parse(raw);
  await prisma.labApplication.update({
    where: { labAppId: data.labAppId },
    data: { status: data.decision },
  });
  revalidatePath("/admin/labs");
}

export async function submitLabProposal(raw: unknown) {
  const me = await requireMember();
  const data = submitLabProposalSchema.parse(raw);
  const proposal = await prisma.labProposal.create({
    data: {
      proposedById: me.memberId,
      proposedName: data.proposedName,
      description: data.description,
      objective: data.objective,
    },
  });
  revalidatePath("/labs");
  revalidatePath("/admin/proposals");
  return proposal;
}

export async function decideLabProposal(raw: unknown) {
  const officer = await requireOfficer(2);
  const data = decideProposalSchema.parse(raw);

  const proposal = await prisma.labProposal.findUnique({
    where: { proposalId: data.proposalId },
  });
  if (!proposal) throw new Error("Proposal not found.");

  if (data.decision === "REJECTED") {
    await prisma.labProposal.update({
      where: { proposalId: data.proposalId },
      data: { status: "REJECTED", reviewedById: officer.memberId },
    });
    revalidatePath("/admin/proposals");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.lab.create({
      data: {
        labName: proposal.proposedName,
        description: proposal.description,
        objective: proposal.objective,
      },
    });
    await tx.labProposal.update({
      where: { proposalId: data.proposalId },
      data: { status: "APPROVED", reviewedById: officer.memberId },
    });
  });

  revalidatePath("/admin/proposals");
  revalidatePath("/labs");
}

export async function listLabs() {
  return prisma.lab.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { applications: true } } },
  });
}

export async function getLabRoster(labId: string) {
  await requireOfficer(1);
  return prisma.labApplication.findMany({
    where: { labId },
    include: { member: { include: { officerProfile: true } } },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getMyLabApplications(memberId: string) {
  return prisma.labApplication.findMany({
    where: { memberId },
    include: { lab: true },
    orderBy: { appliedAt: "desc" },
  });
}
