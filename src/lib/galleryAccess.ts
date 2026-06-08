import { prisma } from "@/lib/prisma";
import { isSiteAdmin } from "@/lib/permissions";
import type { SessionLike } from "@/lib/session";

/** Site admins or anyone assigned as a lab’s leader — may delete any gallery photo. */
export async function canModerateGalleryDeletes(user: SessionLike | null): Promise<boolean> {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  const led = await prisma.labLeaderAssignment.findFirst({
    where: { memberId: user.memberId },
    select: { labId: true },
  });
  return !!led;
}
