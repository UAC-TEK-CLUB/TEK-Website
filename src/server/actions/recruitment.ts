"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireOfficer } from "@/lib/permissions";
import {
  submitApplicationSchema,
  decideApplicationSchema,
} from "@/lib/validators/recruitment";
import type { ApplicationStatus } from "@prisma/client";

const VISITOR_COOKIE = "tek_visitor_id";

export async function recordVisit() {
  const cookieStore = cookies();
  const headerStore = headers();

  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";

  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) {
    const found = await prisma.visitor.findUnique({ where: { visitorId: existing } });
    if (found) return existing;
  }

  const created = await prisma.visitor.create({
    data: { ipAddress: ip, browserType: ua },
  });
  return created.visitorId;
}

export async function submitApplication(raw: unknown) {
  const data = submitApplicationSchema.parse(raw);
  const visitorId = await recordVisit();

  return prisma.$transaction(async (tx) => {
    await tx.applicant.upsert({
      where: { universityId: data.universityId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      create: {
        universityId: data.universityId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
    });

    const application = await tx.clubApplication.create({
      data: {
        applicantId: data.universityId,
        visitorId,
        major: data.major,
        codingExperience: data.codingExperience,
      },
    });

    return { clubAppId: application.clubAppId };
  });
}

export async function listApplications(filters?: { status?: ApplicationStatus }) {
  await requireOfficer();
  return prisma.clubApplication.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    include: { applicant: true, visitor: true },
    orderBy: { submittedAt: "desc" },
  });
}

export async function decideApplication(raw: unknown) {
  await requireOfficer(2);
  const data = decideApplicationSchema.parse(raw);

  const application = await prisma.clubApplication.findUnique({
    where: { clubAppId: data.clubAppId },
    include: { applicant: true },
  });
  if (!application) throw new Error("Application not found.");

  if (data.decision !== "APPROVED") {
    await prisma.clubApplication.update({
      where: { clubAppId: data.clubAppId },
      data: { status: data.decision },
    });
    revalidatePath("/admin/applicants");
    return;
  }

  if (!data.expectedGraduation) {
    throw new Error("Expected graduation is required for approvals.");
  }

  const tempPassword = data.initialPassword ?? generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.upsert({
      where: { universityId: application.applicant.universityId },
      update: {},
      create: {
        universityId: application.applicant.universityId,
        email: application.applicant.email,
        firstName: application.applicant.firstName,
        lastName: application.applicant.lastName,
        passwordHash,
        memberType: "REGULAR",
        membershipStatus: "ACTIVE",
      },
    });

    await tx.regularMember.upsert({
      where: { memberId: member.memberId },
      create: {
        memberId: member.memberId,
        expectedGraduation: data.expectedGraduation!,
      },
      update: { expectedGraduation: data.expectedGraduation! },
    });

    await tx.clubApplication.update({
      where: { clubAppId: data.clubAppId },
      data: { status: "APPROVED" },
    });
  });

  revalidatePath("/admin/applicants");
  revalidatePath("/admin/members");

  return { tempPassword };
}

export async function visitorAnalytics() {
  await requireOfficer();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [total, last30, withApp] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { visitedAt: { gte: since } } }),
    prisma.visitor.count({ where: { applications: { some: {} } } }),
  ]);
  return { total, last30, withApp };
}

function generateTempPassword() {
  return Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((b) => "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"[b % 54])
    .join("");
}
