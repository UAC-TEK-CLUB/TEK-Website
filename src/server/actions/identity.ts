"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMember, requireSiteAdmin } from "@/lib/permissions";
import {
  changePasswordSchema,
  completeRegistrationSchema,
  promoteOfficerSchema,
  setMembershipStatusSchema,
  setOfficerRoleSchema,
  updateProfileSchema,
} from "@/lib/validators/identity";

export async function completeRegistration(raw: unknown) {
  const parsed = completeRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      fe.username?.[0] ??
      fe.password?.[0] ??
      fe.expectedGraduation?.[0] ??
      fe.token?.[0] ??
      "Invalid registration data.";
    throw new Error(msg);
  }
  const data = parsed.data;

  const application = await prisma.clubApplication.findUnique({
    where: { accountSetupToken: data.token },
    include: { applicant: true },
  });
  if (!application || application.status !== "APPROVED") {
    throw new Error("This setup link is invalid or has already been used.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const member = await prisma.$transaction(async (tx) => {
    const existingBySchool = await tx.member.findUnique({
      where: { universityId: application.applicant.universityId },
    });
    if (existingBySchool) {
      throw new Error("An account already exists for this application.");
    }

    const usernameTaken = await tx.member.findUnique({
      where: { username: data.username },
    });
    if (usernameTaken) {
      throw new Error("That username is already taken. Pick another.");
    }

    const created = await tx.member.create({
      data: {
        username: data.username,
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

  return { username: member.username };
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

export async function promoteToOfficer(raw: unknown) {
  await requireSiteAdmin();
  const data = promoteOfficerSchema.parse(raw);
  const adminAccessLevel = data.officerRole === "LEADER" ? 2 : 5;

  await prisma.$transaction(async (tx) => {
    await tx.regularMember.deleteMany({ where: { memberId: data.memberId } });
    await tx.clubOfficer.upsert({
      where: { memberId: data.memberId },
      create: {
        memberId: data.memberId,
        adminAccessLevel,
        officerRole: data.officerRole,
      },
      update: {
        adminAccessLevel,
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
  await requireSiteAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.labLeaderAssignment.deleteMany({ where: { memberId } });
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
  const me = await requireSiteAdmin();
  const data = setOfficerRoleSchema.parse(raw);

  const current = await prisma.clubOfficer.findUnique({
    where: { memberId: data.memberId },
    select: { officerRole: true },
  });
  if (current?.officerRole === "PRESIDENT" && data.officerRole !== "PRESIDENT") {
    const otherPresidents = await prisma.clubOfficer.count({
      where: { officerRole: "PRESIDENT", NOT: { memberId: data.memberId } },
    });
    if (otherPresidents < 1) {
      throw new Error(
        "Assign another president before removing the last president role from this person."
      );
    }
  }

  const adminAccessLevel = data.officerRole === "LEADER" ? 2 : 5;

  await prisma.clubOfficer.update({
    where: { memberId: data.memberId },
    data: { officerRole: data.officerRole, adminAccessLevel },
  });

  revalidatePath("/admin/members");
  revalidatePath("/dashboard");
}

export async function setMembershipStatus(raw: unknown) {
  const me = await requireSiteAdmin();
  const data = setMembershipStatusSchema.parse(raw);

  if (data.memberId === me.memberId) {
    throw new Error("You cannot change your own membership status.");
  }

  await prisma.member.update({
    where: { memberId: data.memberId },
    data: { membershipStatus: data.status },
  });

  revalidatePath("/admin/members");
  revalidatePath("/dashboard");
}

export async function changeMyPassword(raw: unknown) {
  const me = await requireMember();
  const data = changePasswordSchema.parse(raw);

  const member = await prisma.member.findUnique({
    where: { memberId: me.memberId },
    select: { passwordHash: true },
  });
  if (!member?.passwordHash) {
    throw new Error("This account does not have a password set.");
  }

  const ok = await bcrypt.compare(data.currentPassword, member.passwordHash);
  if (!ok) {
    throw new Error("Current password is incorrect.");
  }
  if (data.currentPassword === data.newPassword) {
    throw new Error("New password must be different from your current password.");
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.member.update({
    where: { memberId: me.memberId },
    data: { passwordHash },
  });
}
