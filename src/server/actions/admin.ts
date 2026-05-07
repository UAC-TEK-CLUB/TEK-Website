"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOfficer } from "@/lib/permissions";
import { recordHealthLogSchema } from "@/lib/validators/community";

export async function recordHealthLog(raw: unknown) {
  const officer = await requireOfficer(1);
  const data = recordHealthLogSchema.parse(raw);
  const log = await prisma.websiteHealthLog.create({
    data: {
      recordedById: officer.memberId,
      metricName: data.metricName,
      metricValue: data.metricValue,
    },
  });
  revalidatePath("/admin/health");
  return log;
}

export async function listHealthLogs(opts?: {
  metric?: string;
  since?: Date;
}) {
  await requireOfficer(1);
  return prisma.websiteHealthLog.findMany({
    where: {
      metricName: opts?.metric,
      recordedAt: opts?.since ? { gte: opts.since } : undefined,
    },
    orderBy: { recordedAt: "desc" },
    take: 200,
    include: {
      recordedBy: { include: { member: true } },
    },
  });
}
