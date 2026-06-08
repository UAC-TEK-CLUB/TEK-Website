import type { OfficerRole } from "@prisma/client";
import type { Session } from "next-auth";

/** Minimal session shape used by access-control helpers. */
export type SessionLike = {
  memberId: string;
  memberType: string;
  officerRole?: OfficerRole | null;
};

export function sessionLikeFromUser(
  user: Session["user"] | null | undefined
): SessionLike | null {
  if (!user?.memberId) return null;
  return {
    memberId: user.memberId,
    memberType: user.memberType,
    officerRole: user.officerRole ?? null,
  };
}
