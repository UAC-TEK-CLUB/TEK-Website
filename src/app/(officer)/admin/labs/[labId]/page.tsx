import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLabRoster } from "@/server/actions/labs";
import { isPresident, requireSiteAdmin } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabRosterTable } from "@/components/labs/LabRosterTable";
import { SetLabLeaderForm } from "@/components/labs/SetLabLeaderForm";

export default async function AdminLabDetail({
  params,
}: {
  params: { labId: string };
}) {
  const me = await requireSiteAdmin();
  const lab = await prisma.lab.findUnique({ where: { labId: params.labId } });
  if (!lab) notFound();

  const [roster, memberOptions] = await Promise.all([
    getLabRoster(params.labId),
    prisma.member.findMany({
      where: {
        membershipStatus: "ACTIVE",
        OR: [
          { memberType: "REGULAR" },
          { officerProfile: { officerRole: "LEADER" } },
          { memberType: "OFFICER", officerProfile: null },
        ],
      },
      select: {
        memberId: true,
        firstName: true,
        lastName: true,
        memberType: true,
        officerProfile: { select: { officerRole: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{lab.labName}</h1>
        <p className="text-sm text-muted-foreground">{lab.description}</p>
      </div>

      {isPresident(me) ? (
        <SetLabLeaderForm
          labId={lab.labId}
          currentLeaderId={lab.leaderMemberId}
          memberOptions={memberOptions.map((m) => ({
            memberId: m.memberId,
            firstName: m.firstName,
            lastName: m.lastName,
            memberType: m.memberType,
            officerRole: m.officerProfile?.officerRole ?? null,
          }))}
        />
      ) : (
        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          Only the <span className="font-medium text-foreground">president</span> can assign or
          change the lab leader. Supervisors can still review the roster below.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Roster ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <LabRosterTable rows={roster} />
        </CardContent>
      </Card>
    </div>
  );
}
