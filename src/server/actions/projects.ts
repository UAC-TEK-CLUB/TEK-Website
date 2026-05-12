"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { canManageLabApplications } from "@/lib/labAccess";
import {
  deleteLeaderProjectSchema,
  upsertLeaderProjectSchema,
} from "@/lib/validators/projects";

export type CurrentProject = {
  projectId: string;
  title: string;
  description: string;
  photoUrl: string;
  websiteUrl: string | null;
  updatedAt: Date;
  lab: {
    labId: string;
    labName: string;
    leaders: Array<{
      firstName: string;
      lastName: string;
      officerProfile: {
        officerRole: "PRESIDENT" | "SUPERVISOR" | "LEADER";
      } | null;
    }>;
  };
};

export async function upsertLabSpotlightProject(raw: unknown) {
  const me = await requireMember();
  const data = upsertLeaderProjectSchema.parse(raw);
  if (!(await canManageLabApplications(me, data.labId))) {
    throw new Error("You can only edit the spotlight for a lab you lead (or as an executive).");
  }

  await prisma.leaderProject.upsert({
    where: { labId: data.labId },
    create: {
      labId: data.labId,
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl,
      websiteUrl: data.websiteUrl,
    },
    update: {
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl,
      websiteUrl: data.websiteUrl,
    },
  });

  revalidatePath("/");
  revalidatePath(`/labs/${data.labId}`);
  revalidatePath(`/labs/${data.labId}/console`);
  revalidatePath("/admin/projects");
}

export async function deleteLabSpotlightProject(raw: unknown) {
  const me = await requireMember();
  const data = deleteLeaderProjectSchema.parse(raw);

  const project = await prisma.leaderProject.findUnique({
    where: { projectId: data.projectId },
    select: { labId: true },
  });
  if (!project) return;
  if (!(await canManageLabApplications(me, project.labId))) {
    throw new Error("You can only remove a spotlight for a lab you manage.");
  }

  await prisma.leaderProject.delete({
    where: { projectId: data.projectId },
  });

  revalidatePath("/");
  revalidatePath(`/labs/${project.labId}`);
  revalidatePath(`/labs/${project.labId}/console`);
  revalidatePath("/admin/projects");
}

export async function listCurrentProjects(limit = 6) {
  const rows = await prisma.leaderProject.findMany({
    include: {
      lab: {
        select: {
          labId: true,
          labName: true,
          leaderAssignments: {
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
                  officerProfile: { select: { officerRole: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    ...row,
    lab: {
      labId: row.lab.labId,
      labName: row.lab.labName,
      leaders: row.lab.leaderAssignments.map((a) => a.member),
    },
  }));
}
