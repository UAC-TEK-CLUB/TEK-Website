"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireMember,
  requireOfficer,
  requirePresident,
} from "@/lib/permissions";
import {
  assignMentorSchema,
  completeRegistrationSchema,
  promoteOfficerSchema,
  setMembershipStatusSchema,
  setOfficerRoleSchema,
  updateProfileSchema,
} from "@/lib/validators/identity";

export async function completeRegistration(raw: unknown) {
  const data = completeRegistrationSchema.parse(raw);

  const application = await prisma.clubApplication.findUnique({
    where: { accountSetupToken: data.token },
    include: { applicant: true },
  });
  if (!application || application.status !== "APPROVED") {
    throw new Error("This setup link is invalid or has already been used.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const member = await prisma.$transaction(async (tx) => {
    const existing = await tx.member.findUnique({
      where: { universityId: application.applicant.universityId },
    });
    if (existing) {
      throw new Error("An account already exists for this university ID.");
    }

    const created = await tx.member.create({
      data: {
        universityId: application.applicant.universityId,
        email: application.applicant.email,
        firstName: application.applicant.firstName,
        lastName: application.applicant.lastName,
        passwordHash,
        memberType: "REGULAR",
        membershipStatus: "ACTIVE",
      },
    });

    await tx.regularMember.create({
      data: {
        memberId: created.memberId,
        expectedGraduation: data.expectedGraduation,
      },
    });

    await tx.clubApplication.update({
      where: { clubAppId: application.clubAppId },
      data: { accountSetupToken: null },
    });

    return created;
  });

  revalidatePath("/admin/applicants");
  revalidatePath("/admin/members");

  return { universityId: member.universityId };
}

export async function updateMemberProfile(raw: unknown) {
  const me = await requireMember();
  const data = updateProfileSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { memberId: me.memberId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
    });

    if (data.expectedGraduation && me.memberType === "REGULAR") {
      await tx.regularMember.update({
        where: { memberId: me.memberId },
        data: { expectedGraduation: data.expectedGraduation },
      });
    }
  });

  revalidatePath("/profile");
}

export async function assignMentor(raw: unknown) {
  await requireOfficer();
  const data = assignMentorSchema.parse(raw);

  if (data.mentorId === data.menteeId) {
    throw new Error("A member cannot mentor themselves.");
  }

  await prisma.member.update({
    where: { memberId: data.menteeId },
    data: { mentorId: data.mentorId },
  });

  revalidatePath("/admin/members");
  revalidatePath("/profile");
}

export async function promoteToOfficer(raw: unknown) {
  await requirePresident();
  const data = promoteOfficerSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.regularMember.deleteMany({ where: { memberId: data.memberId } });
    await tx.clubOfficer.upsert({
      where: { memberId: data.memberId },
      create: {
        memberId: data.memberId,
        adminAccessLevel: data.adminAccessLevel,
        officerRole: data.officerRole,
      },
      update: {
        adminAccessLevel: data.adminAccessLevel,
        officerRole: data.officerRole,
      },
    });
    await tx.member.update({
      where: { memberId: data.memberId },
      data: { memberType: "OFFICER" },
    });
  });

  revalidatePath("/admin/members");
}

export async function demoteToRegular(memberId: string, expectedGraduation: Date) {
  await requirePresident();

  await prisma.$transaction(async (tx) => {
    await tx.clubOfficer.deleteMany({ where: { memberId } });
    await tx.regularMember.upsert({
      where: { memberId },
      create: { memberId, expectedGraduation },
      update: { expectedGraduation },
    });
    await tx.member.update({
      where: { memberId },
      data: { memberType: "REGULAR" },
    });
  });

  revalidatePath("/admin/members");
}

export async function setOfficerRole(raw: unknown) {
  const me = await requirePresident();
  const data = setOfficerRoleSchema.parse(raw);

  if (data.memberId === me.memberId && data.officerRole !== "PRESIDENT") {
    throw new Error(
      "The president can't demote themselves. Promote another officer to president first."
    );
  }

  await prisma.clubOfficer.update({
    where: { memberId: data.memberId },
    data: { officerRole: data.officerRole },
  });

  revalidatePath("/admin/members");
  revalidatePath("/dashboard");
}

export async function setMembershipStatus(raw: unknown) {
  await requireOfficer(2);
  const data = setMembershipStatusSchema.parse(raw);

  await prisma.member.update({
    where: { memberId: data.memberId },
    data: { membershipStatus: data.status },
  });

  revalidatePath("/admin/members");
}
