import type { OfficerRole, PrismaClient } from "@prisma/client";

type DbClient = Pick<PrismaClient, "member" | "regularMember" | "clubOfficer">;

export function adminAccessLevelForRole(role: OfficerRole): number {
  return role === "LEADER" ? 2 : 5;
}

/** Promote an active member to officer (sequential writes — safe on Neon HTTP). */
export async function promoteMemberToOfficer(
  db: DbClient,
  memberId: string,
  officerRole: OfficerRole
): Promise<void> {
  const adminAccessLevel = adminAccessLevelForRole(officerRole);
  await db.regularMember.deleteMany({ where: { memberId } });
  await db.clubOfficer.upsert({
    where: { memberId },
    create: { memberId, adminAccessLevel, officerRole },
    update: { adminAccessLevel, officerRole },
  });
  await db.member.update({
    where: { memberId },
    data: { memberType: "OFFICER" },
  });
}

/**
 * Ensure a member can be assigned as lab leader (promotes REGULAR → LEADER officer if needed).
 */
export async function ensureMemberReadyAsLabLeader(
  db: DbClient,
  leaderId: string
): Promise<void> {
  const member = await db.member.findUnique({
    where: { memberId: leaderId },
    include: { officerProfile: true },
  });
  if (!member) throw new Error("Member not found.");
  if (member.membershipStatus !== "ACTIVE") {
    throw new Error("Only active members can be assigned as lab leaders.");
  }
  const role = member.officerProfile?.officerRole;
  if (role === "SUPERVISOR") {
    throw new Error("Supervisor cannot be assigned as a lab leader.");
  }

  if (member.memberType === "REGULAR") {
    await promoteMemberToOfficer(db, leaderId, "LEADER");
  } else if (member.memberType === "OFFICER" && !member.officerProfile) {
    await db.clubOfficer.create({
      data: {
        memberId: leaderId,
        adminAccessLevel: adminAccessLevelForRole("LEADER"),
        officerRole: "LEADER",
      },
    });
  }
}
