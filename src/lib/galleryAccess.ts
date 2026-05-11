import type { OfficerRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSiteAdmin } from "@/lib/permissions";

type SessionLike = {
  memberId: string;
  memberType: string;
  officerRole?: OfficerRole | null;
};

/** Site admins or anyone assigned as a lab’s leader — may delete any gallery photo. */
export async function canModerateGalleryDeletes(user: SessionLike | null): Promise<boolean> {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  const led = await prisma.lab.findFirst({
    where: { leaderMemberId: user.memberId },
    select: { labId: true },
  });
  return !!led;
}
