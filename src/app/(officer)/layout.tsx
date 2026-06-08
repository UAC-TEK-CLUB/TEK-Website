/** Route group `(officer)` serves URLs under `/admin/*` (not `/officer`). */
import { MemberShell } from "@/components/layout/MemberShell";
import { isSiteAdmin, requireExecutive } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireExecutive();
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
    >
      {children}
    </MemberShell>
  );
}
