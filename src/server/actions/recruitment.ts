"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireExecutive, requireSiteAdmin } from "@/lib/permissions";
import {
  submitApplicationSchema,
  decideApplicationSchema,
  resendAccountSetupSchema,
} from "@/lib/validators/recruitment";
import { isAutoEligible } from "@/lib/policy/autoAccept";
import { sendMail } from "@/lib/mail/transport";
import {
  acceptanceEmail,
  pendingEmail,
  rejectionEmail,
} from "@/lib/mail/templates";
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
  const accepted = isAutoEligible(data.major);

  const result = await prisma.$transaction(async (tx) => {
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
        status: accepted ? "APPROVED" : "PENDING",
        accountSetupToken: accepted ? crypto.randomUUID() : null,
      },
    });

    return application;
  });

  revalidatePath("/admin/applicants");

  if (accepted && result.accountSetupToken) {
    const registerPath = `/register?token=${result.accountSetupToken}`;
    await sendMail(
      acceptanceEmail({
        to: data.email,
        firstName: data.firstName,
        registerPath,
        autoAccepted: true,
      })
    );
    return {
      accepted: true as const,
      registerUrl: registerPath,
    };
  }

  await sendMail(pendingEmail({ to: data.email, firstName: data.firstName }));
  return { accepted: false as const };
}

export async function listApplications(filters?: { status?: ApplicationStatus }) {
  await requireExecutive();
  return prisma.clubApplication.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    include: { applicant: true, visitor: true },
    orderBy: { submittedAt: "desc" },
  });
}

export async function decideApplication(raw: unknown) {
  await requireExecutive();
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

    if (data.decision === "REJECTED") {
      await sendMail(
        rejectionEmail({
          to: application.applicant.email,
          firstName: application.applicant.firstName,
        })
      );
    }
    return;
  }

  const accountSetupToken = application.accountSetupToken ?? crypto.randomUUID();
  const registerPath = `/register?token=${accountSetupToken}`;

  await prisma.clubApplication.update({
    where: { clubAppId: data.clubAppId },
    data: {
      status: "APPROVED",
      accountSetupToken,
    },
  });

  revalidatePath("/admin/applicants");

  await sendMail(
    acceptanceEmail({
      to: application.applicant.email,
      firstName: application.applicant.firstName,
      registerPath,
      autoAccepted: false,
    })
  );

  return {
    registerUrl: registerPath,
  };
}

/** New token + email for approved applicants who never finished /register. */
export async function resendAccountSetupLink(raw: unknown) {
  await requireExecutive();
  const data = resendAccountSetupSchema.parse(raw);

  const application = await prisma.clubApplication.findUnique({
    where: { clubAppId: data.clubAppId },
    include: { applicant: true },
  });
  if (!application) throw new Error("Application not found.");
  if (application.status !== "APPROVED") {
    throw new Error("Only approved applications can receive a setup link.");
  }

  const existingMember = await prisma.member.findUnique({
    where: { universityId: application.applicantId },
  });
  if (existingMember) {
    throw new Error("This applicant already completed registration.");
  }

  const accountSetupToken = crypto.randomUUID();
  const registerPath = `/register?token=${accountSetupToken}`;

  await prisma.clubApplication.update({
    where: { clubAppId: data.clubAppId },
    data: { accountSetupToken },
  });

  revalidatePath("/admin/applicants");

  await sendMail(
    acceptanceEmail({
      to: application.applicant.email,
      firstName: application.applicant.firstName,
      registerPath,
      autoAccepted: false,
      reminder: true,
    })
  );

  return { registerUrl: registerPath };
}

export async function visitorAnalytics() {
  await requireSiteAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [total, last30, withApp] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { visitedAt: { gte: since } } }),
    prisma.visitor.count({ where: { applications: { some: {} } } }),
  ]);
  return { total, last30, withApp };
}
