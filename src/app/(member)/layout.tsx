import { MemberShell } from "@/components/layout/MemberShell";
import { PresidentMemberAlerts } from "@/components/recruitment/PresidentMemberAlerts";
import { isPresident, isSiteAdmin, requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMember();
  const ledLabs = await prisma.lab.findMany({
    where: { leaderAssignments: { some: { memberId: user.memberId } } },
    select: { labId: true, labName: true },
    orderBy: { labName: "asc" },
  });
  return (
    <MemberShell
      isSiteAdmin={isSiteAdmin(user)}
      officerRole={user.officerRole ?? null}
      ledLabs={ledLabs}
      alerts={isPresident(user) ? <PresidentMemberAlerts /> : undefined}
    >
      {children}
    </MemberShell>
  );
}
