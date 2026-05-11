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
  updatedAt: Date;
  lab: {
    labId: string;
    labName: string;
    leader: {
      firstName: string;
      lastName: string;
      officerProfile: {
        officerRole: "PRESIDENT" | "SUPERVISOR" | "LEADER";
      } | null;
    } | null;
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
    },
    update: {
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl,
    },
  });

  revalidatePath("/");
  revalidatePath(`/labs/${data.labId}`);
  revalidatePath(`/member/labs/${data.labId}/manage`);
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
  revalidatePath(`/member/labs/${project.labId}/manage`);
  revalidatePath("/admin/projects");
}

export async function listCurrentProjects(limit = 6) {
  return prisma.leaderProject.findMany({
    include: {
      lab: {
        select: {
          labId: true,
          labName: true,
          leader: {
            select: {
              firstName: true,
              lastName: true,
              officerProfile: { select: { officerRole: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}
