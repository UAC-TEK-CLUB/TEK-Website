import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export type LabPublicRosterRow = {
  labAppId: string;
  appliedAt: Date;
  member: { memberId: string; firstName: string; lastName: string; email: string };
};

type LeaderProfile = { memberId: string; firstName: string; lastName: string; email: string };

function PersonRow({
  name,
  email,
  meta,
  badges,
}: {
  name: string;
  email: string;
  meta?: string;
  badges?: ReactNode;
}) {
  return (
    <li className="rounded-md border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{name}</p>
        {badges}
      </div>
      <p className="text-xs text-muted-foreground">{email}</p>
      {meta && <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>}
    </li>
  );
}

export function LabPublicRoster({
  rows,
  leaderMemberIds,
  leaders,
}: {
  rows: LabPublicRosterRow[];
  leaderMemberIds: string[];
  leaders: LeaderProfile[];
}) {
  const leaderSet = new Set(leaderMemberIds);
  const leadersNotInRoster = leaders.filter((l) => !rows.some((r) => r.member.memberId === l.memberId));
  const extraLeaderRows = leadersNotInRoster.length;
  const memberCount = rows.length + extraLeaderRows;

  return (
    <Card className="h-fit border-muted lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Roster</CardTitle>
        <p className="text-xs font-normal text-muted-foreground">
          Approved lab members. Pending applications are handled in your lab console.
        </p>
      </CardHeader>
      <CardContent className="text-sm">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lab members ({memberCount})
        </h3>
        {memberCount === 0 ? (
          <p className="text-xs text-muted-foreground">No approved members yet.</p>
        ) : (
          <ul className="space-y-2">
            {leadersNotInRoster.map((leader) => (
              <PersonRow
                key={`leader-${leader.memberId}`}
                name={`${leader.firstName} ${leader.lastName}`}
                email={leader.email}
                badges={
                  <Badge variant="secondary" className="text-[10px]">
                    Leader
                  </Badge>
                }
              />
            ))}
            {rows.map((row) => {
              const isLeader = leaderSet.has(row.member.memberId);
              return (
                <PersonRow
                  key={row.labAppId}
                  name={`${row.member.firstName} ${row.member.lastName}`}
                  email={row.member.email}
                  meta={`Joined ${formatDate(row.appliedAt)}`}
                  badges={
                    isLeader ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Leader
                      </Badge>
                    ) : undefined
                  }
                />
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
