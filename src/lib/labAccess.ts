import { prisma } from "@/lib/prisma";
import type { OfficerRole } from "@prisma/client";
import { isSiteAdmin } from "@/lib/permissions";

type SessionLike = {
  memberId: string;
  memberType: string;
  officerRole?: OfficerRole | null;
};

export async function canManageLabApplications(me: SessionLike, labId: string): Promise<boolean> {
  if (isSiteAdmin(me)) return true;
  if (me.memberType !== "OFFICER" || me.officerRole !== "LEADER") return false;
  const lab = await prisma.lab.findUnique({
    where: { labId },
    select: { leaderMemberId: true },
  });
  return lab?.leaderMemberId === me.memberId;
}

/** Approved lab roster, lab leader, or site admin — can read lab-scoped bulletin posts on the lab page. */
export async function canViewLabAnnouncements(me: SessionLike, labId: string): Promise<boolean> {
  if (isSiteAdmin(me)) return true;
  if (await canManageLabApplications(me, labId)) return true;
  const approved = await prisma.labApplication.findFirst({
    where: { memberId: me.memberId, labId, status: "APPROVED" },
    select: { labAppId: true },
  });
  return !!approved;
}

/**
 * Who may see the member/applicant roster on the public lab page: same as announcements, plus
 * anyone with a pending application (so they can see who’s already in the lab).
 */
export async function canViewLabRosterOnPublicLabPage(me: SessionLike, labId: string): Promise<boolean> {
  if (await canViewLabAnnouncements(me, labId)) return true;
  const pending = await prisma.labApplication.findFirst({
    where: { memberId: me.memberId, labId, status: "PENDING" },
    select: { labAppId: true },
  });
  return !!pending;
}
