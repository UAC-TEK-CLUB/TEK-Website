"use server";

import { revalidatePath } from "next/cache";
import type { OfficerRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireMember, requirePresident, requireSiteAdmin } from "@/lib/permissions";
import { canManageLabApplications } from "@/lib/labAccess";
import {
  createLabSchema,
  decideLabAppSchema,
  decideProposalSchema,
  setLabLeadersSchema,
  submitLabProposalSchema,
} from "@/lib/validators/labs";

export async function createLab(raw: unknown) {
  await requireSiteAdmin();
  const data = createLabSchema.parse(raw);
  const lab = await prisma.lab.create({ data });
  revalidatePath("/labs");
  revalidatePath("/admin/labs");
  return lab;
}

async function ensureMemberReadyAsLabLeader(tx: Prisma.TransactionClient, leaderId: string) {
  const member = await tx.member.findUnique({
    where: { memberId: leaderId },
    include: { officerProfile: true },
  });
  if (!member) throw new Error("Member not found.");
  if (member.membershipStatus !== "ACTIVE") {
    throw new Error("Only active members can be assigned as lab leaders.");
  }
  const role = member.officerProfile?.officerRole;
  if (role === "SUPERVISOR") {
    throw new Error("Supervisor cannot be assigned as a lab leader.");
  }

  if (member.memberType === "REGULAR") {
    await tx.regularMember.deleteMany({ where: { memberId: leaderId } });
    await tx.clubOfficer.upsert({
      where: { memberId: leaderId },
      create: {
        memberId: leaderId,
        adminAccessLevel: 2,
        officerRole: "LEADER",
      },
      update: {
        adminAccessLevel: 2,
        officerRole: "LEADER",
      },
    });
    await tx.member.update({
      where: { memberId: leaderId },
      data: { memberType: "OFFICER" },
    });
  } else if (member.memberType === "OFFICER" && !member.officerProfile) {
    await tx.clubOfficer.create({
      data: {
        memberId: leaderId,
        adminAccessLevel: 2,
        officerRole: "LEADER",
      },
    });
  }
}

/** Replace all lab leader assignments (0–2 people). President only. */
export async function setLabLeaders(raw: unknown) {
  await requirePresident();
  const data = setLabLeadersSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.labLeaderAssignment.deleteMany({ where: { labId: data.labId } });
    for (const leaderId of data.leaderMemberIds) {
      await ensureMemberReadyAsLabLeader(tx, leaderId);
      await tx.labLeaderAssignment.create({
        data: { labId: data.labId, memberId: leaderId },
      });
    }
  });

  revalidatePath("/admin/labs");
  revalidatePath(`/admin/labs/${data.labId}`);
  revalidatePath(`/labs/${data.labId}/console`);
  revalidatePath(`/labs/${data.labId}`);
  revalidatePath("/admin/members");
  revalidatePath("/labs");
}

export async function applyToLab(labId: string) {
  const me = await requireMember();
  if (me.officerRole === "SUPERVISOR") {
    throw new Error("Supervisors do not join labs as members through this page.");
  }
  const application = await prisma.labApplication.upsert({
    where: { memberId_labId: { memberId: me.memberId, labId } },
    update: { status: "PENDING" },
    create: { memberId: me.memberId, labId, status: "PENDING" },
  });
  revalidatePath("/labs");
  revalidatePath(`/labs/${labId}`);
  return application;
}

export async function decideLabApplication(raw: unknown) {
  const me = await requireMember();
  const data = decideLabAppSchema.parse(raw);

  const app = await prisma.labApplication.findUnique({
    where: { labAppId: data.labAppId },
    select: { labId: true },
  });
  if (!app) throw new Error("Application not found.");

  if (!(await canManageLabApplications(me, app.labId))) {
    throw new Error("You do not manage applications for this lab.");
  }

  await prisma.labApplication.update({
    where: { labAppId: data.labAppId },
    data: { status: data.decision },
  });
  revalidatePath("/admin/labs");
  revalidatePath(`/admin/labs/${app.labId}`);
  revalidatePath(`/labs/${app.labId}/console`);
  revalidatePath(`/labs/${app.labId}`);
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
  const officer = await requirePresident();
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
  });
}

export async function getLabRoster(labId: string) {
  const me = await requireMember();
  if (!(await canManageLabApplications(me, labId))) {
    throw new Error("You do not manage this lab roster.");
  }
  return prisma.labApplication.findMany({
    where: { labId },
    include: { member: { include: { officerProfile: true } } },
    orderBy: { appliedAt: "desc" },
  });
}

type PublicRosterViewer = {
  memberId: string;
  memberType: string;
  officerRole?: OfficerRole | null;
};

/** Read-only roster for the public lab page; any signed-in member may see it. */
export async function getLabRosterForPublicPage(labId: string, viewer: PublicRosterViewer | null) {
  if (!viewer) return null;
  return prisma.labApplication.findMany({
    where: { labId, status: "APPROVED" },
    include: {
      member: { select: { memberId: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { appliedAt: "asc" },
  });
}

export async function getMyLabApplications(memberId: string) {
  return prisma.labApplication.findMany({
    where: { memberId },
    include: { lab: true },
    orderBy: { appliedAt: "desc" },
  });
}
