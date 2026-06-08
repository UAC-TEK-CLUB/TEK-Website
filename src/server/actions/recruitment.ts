"use server";

import { cookies, headers } from "next/headers";
import { firstZodFieldError } from "@/lib/actionResult";
import { VISITOR_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireExecutive, requirePresident, requireSiteAdmin } from "@/lib/permissions";
import { revalidateApplicants } from "@/lib/revalidate";
import { routes } from "@/lib/routes";
import { fullName } from "@/lib/utils";
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

export type SubmitApplicationResult =
  | { ok: true; accepted: true; registerUrl: string }
  | { ok: true; accepted: false }
  | { ok: false; error: string };

export async function submitApplication(raw: unknown): Promise<SubmitApplicationResult> {
  const parsed = submitApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: firstZodFieldError(
        submitApplicationSchema,
        raw,
        "Please check your application and try again."
      ),
    };
  }
  const data = parsed.data;

  let visitorId: string;
  try {
    visitorId = await recordVisit();
  } catch {
    return {
      ok: false,
      error: "Could not submit your application right now. Please try again in a moment.",
    };
  }

  const accepted = isAutoEligible(data.major);
  const accountSetupToken = accepted ? crypto.randomUUID() : null;

  let application;
  try {
    // Neon HTTP on Workers does not support interactive $transaction — use sequential writes.
    await prisma.applicant.upsert({
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

    application = await prisma.clubApplication.create({
      data: {
        applicantId: data.universityId,
        visitorId,
        major: data.major,
        codingExperience: data.codingExperience,
        status: accepted ? "APPROVED" : "PENDING",
        accountSetupToken,
      },
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return {
        ok: false,
        error:
          "We already have an application on file for this university ID or email. Check your inbox or contact the club if you need help.",
      };
    }
    console.error("[submitApplication]", err);
    return {
      ok: false,
      error: "Could not save your application. Please try again or contact the club president.",
    };
  }

  revalidateApplicants();

  if (accepted && application.accountSetupToken) {
    const registerPath = routes.register(application.accountSetupToken);
    await sendMail(
      acceptanceEmail({
        to: data.email,
        firstName: data.firstName,
        registerPath,
        autoAccepted: true,
      })
    );
    return {
      ok: true,
      accepted: true,
      registerUrl: registerPath,
    };
  }

  await sendMail(pendingEmail({ to: data.email, firstName: data.firstName }));
  return { ok: true, accepted: false };
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
    revalidateApplicants();

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
  const registerPath = routes.register(accountSetupToken);

  await prisma.clubApplication.update({
    where: { clubAppId: data.clubAppId },
    data: {
      status: "APPROVED",
      accountSetupToken,
    },
  });

  revalidateApplicants();

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
  const registerPath = routes.register(accountSetupToken);

  await prisma.clubApplication.update({
    where: { clubAppId: data.clubAppId },
    data: { accountSetupToken },
  });

  revalidateApplicants();

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

export type PresidentMemberAlert = {
  id: string;
  type: "application_approved" | "member_joined";
  title: string;
  detail: string;
  href: string;
  at: string;
};

/** Recent approvals and new member registrations for the president notification popups. */
export async function getPresidentMemberAlerts(
  sinceIso: string
): Promise<PresidentMemberAlert[]> {
  await requirePresident();
  const since = new Date(sinceIso);
  if (Number.isNaN(since.getTime())) {
    return [];
  }

  const [applications, members] = await Promise.all([
    prisma.clubApplication.findMany({
      where: { status: "APPROVED", submittedAt: { gt: since } },
      include: { applicant: true },
      orderBy: { submittedAt: "desc" },
      take: 20,
    }),
    prisma.member.findMany({
      where: { joinDate: { gt: since }, memberType: "REGULAR" },
      orderBy: { joinDate: "desc" },
      take: 20,
      select: {
        memberId: true,
        firstName: true,
        lastName: true,
        username: true,
        joinDate: true,
      },
    }),
  ]);

  const alerts: PresidentMemberAlert[] = [];

  for (const app of applications) {
    alerts.push({
      id: `app:${app.clubAppId}`,
      type: "application_approved",
      title: "Application approved",
      detail: `${fullName(app.applicant.firstName, app.applicant.lastName)} · ${app.major}`,
      href: "/admin/applicants",
      at: app.submittedAt.toISOString(),
    });
  }

  for (const member of members) {
    alerts.push({
      id: `member:${member.memberId}`,
      type: "member_joined",
      title: "New member joined",
      detail: `${fullName(member.firstName, member.lastName)} (@${member.username})`,
      href: "/admin/members",
      at: member.joinDate.toISOString(),
    });
  }

  return alerts.sort((a, b) => b.at.localeCompare(a.at));
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
