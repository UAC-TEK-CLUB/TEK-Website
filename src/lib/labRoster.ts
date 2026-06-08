import { prisma } from "@/lib/prisma";
import { getLabRoster } from "@/server/actions/labs";

type RosterRow = Awaited<ReturnType<typeof getLabRoster>>[number];
type LeaderMember = { memberId: string; firstName: string; lastName: string; email: string };

export function computeLabRosterTableCount(
  roster: { member: { memberId: string } }[],
  rosterLeaders: { memberId: string }[]
): number {
  const memberIdsWithApplication = new Set(roster.map((r) => r.member.memberId));
  const leaderRowsWithoutApplication = rosterLeaders.filter(
    (m) => !memberIdsWithApplication.has(m.memberId)
  ).length;
  return roster.length + leaderRowsWithoutApplication;
}

export async function getLabRosterContext(labId: string): Promise<{
  roster: RosterRow[];
  rosterLeaders: LeaderMember[];
  rosterTableRowCount: number;
} | null> {
  const lab = await prisma.lab.findUnique({
    where: { labId },
    include: {
      leaderAssignments: {
        include: {
          member: {
            select: { memberId: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });
  if (!lab) return null;

  const roster = await getLabRoster(labId);
  const rosterLeaders = lab.leaderAssignments.map((a) => a.member);
  return {
    roster,
    rosterLeaders,
    rosterTableRowCount: computeLabRosterTableCount(roster, rosterLeaders),
  };
}
