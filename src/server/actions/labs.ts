"use server";

import { revalidatePath } from "next/cache";
import type { OfficerRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireMember, requirePresident, requireSiteAdmin } from "@/lib/permissions";
import { canManageLabApplications, canViewLabRosterOnPublicLabPage } from "@/lib/labAccess";
import {
  createLabSchema,
  decideLabAppSchema,
  decideProposalSchema,
  setLabLeaderSchema,
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

export async function setLabLeader(raw: unknown) {
  await requirePresident();
  const data = setLabLeaderSchema.parse(raw);
  const leaderId = data.leaderMemberId;

  if (!leaderId) {
    await prisma.lab.update({
      where: { labId: data.labId },
      data: { leaderMemberId: null },
    });
    revalidatePath("/admin/labs");
    revalidatePath(`/admin/labs/${data.labId}`);
    revalidatePath(`/member/labs/${data.labId}/manage`);
    revalidatePath(`/labs/${data.labId}`);
    revalidatePath("/admin/members");
    return;
  }

  const member = await prisma.member.findUnique({
    where: { memberId: leaderId },
    include: { officerProfile: true },
  });
  if (!member) throw new Error("Member not found.");
  if (member.membershipStatus !== "ACTIVE") {
    throw new Error("Only active members can be assigned as lab leader.");
  }
  const role = member.officerProfile?.officerRole;
  if (role === "PRESIDENT" || role === "SUPERVISOR") {
    throw new Error("President and supervisor cannot be assigned as a lab leader.");
  }

  await prisma.$transaction(async (tx) => {
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

    await tx.lab.update({
      where: { labId: data.labId },
      data: { leaderMemberId: leaderId },
    });
  });

  revalidatePath("/admin/labs");
  revalidatePath(`/admin/labs/${data.labId}`);
  revalidatePath(`/member/labs/${data.labId}/manage`);
  revalidatePath(`/labs/${data.labId}`);
  revalidatePath("/admin/members");
  revalidatePath("/labs");
}

export async function applyToLab(labId: string) {
  const me = await requireMember();
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
  revalidatePath(`/member/labs/${app.labId}/manage`);
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
  const officer = await requireSiteAdmin();
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

/** Read-only roster for the public lab page; `null` if the viewer may not see it. */
export async function getLabRosterForPublicPage(labId: string, viewer: PublicRosterViewer | null) {
  if (!viewer || !(await canViewLabRosterOnPublicLabPage(viewer, labId))) return null;
  return prisma.labApplication.findMany({
    where: { labId, status: { in: ["APPROVED", "PENDING"] } },
    include: {
      member: { select: { memberId: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { appliedAt: "asc" }],
  });
}

export async function getMyLabApplications(memberId: string) {
  return prisma.labApplication.findMany({
    where: { memberId },
    include: { lab: true },
    orderBy: { appliedAt: "desc" },
  });
}
