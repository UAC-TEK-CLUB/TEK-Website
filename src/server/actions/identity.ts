"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMember, requireOfficer } from "@/lib/permissions";
import {
  registerMemberSchema,
  updateProfileSchema,
  assignMentorSchema,
  promoteOfficerSchema,
  setMembershipStatusSchema,
} from "@/lib/validators/identity";

export async function registerMember(raw: unknown) {
  const data = registerMemberSchema.parse(raw);

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        universityId: data.universityId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        memberType: "REGULAR",
        membershipStatus: "ACTIVE",
      },
    });

    await tx.regularMember.create({
      data: {
        memberId: member.memberId,
        expectedGraduation: data.expectedGraduation,
      },
    });

    return { memberId: member.memberId };
  });
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
  await requireOfficer(3);
  const data = promoteOfficerSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.regularMember.deleteMany({ where: { memberId: data.memberId } });
    await tx.clubOfficer.upsert({
      where: { memberId: data.memberId },
      create: {
        memberId: data.memberId,
        adminAccessLevel: data.adminAccessLevel,
      },
      update: { adminAccessLevel: data.adminAccessLevel },
    });
    await tx.member.update({
      where: { memberId: data.memberId },
      data: { memberType: "OFFICER" },
    });
  });

  revalidatePath("/admin/members");
}

export async function demoteToRegular(memberId: string, expectedGraduation: Date) {
  await requireOfficer(3);

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

export async function setMembershipStatus(raw: unknown) {
  await requireOfficer(2);
  const data = setMembershipStatusSchema.parse(raw);

  await prisma.member.update({
    where: { memberId: data.memberId },
    data: { membershipStatus: data.status },
  });

  revalidatePath("/admin/members");
}
