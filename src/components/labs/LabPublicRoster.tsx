import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@prisma/client";

export type LabPublicRosterRow = {
  labAppId: string;
  status: ApplicationStatus;
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
  leaderMemberId,
  leaderProfile,
}: {
  rows: LabPublicRosterRow[];
  leaderMemberId: string | null;
  leaderProfile: LeaderProfile | null;
}) {
  const members = rows.filter((r) => r.status === "APPROVED");
  const applicants = rows.filter((r) => r.status === "PENDING");

  const leaderInRoster =
    leaderMemberId != null &&
    members.some((r) => r.member.memberId === leaderMemberId);
  const showLeaderRow = !!(leaderProfile && !leaderInRoster);
  const memberCount = members.length + (showLeaderRow ? 1 : 0);

  return (
    <Card className="h-fit border-muted lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Roster</CardTitle>
        <p className="text-xs font-normal text-muted-foreground">
          Lab members and pending applicants. Leaders approve or decline from the lab manage page.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lab members ({memberCount})
          </h3>
          {memberCount === 0 ? (
            <p className="text-xs text-muted-foreground">No approved members yet.</p>
          ) : (
            <ul className="space-y-2">
              {showLeaderRow && leaderProfile && (
                <PersonRow
                  key={`leader-${leaderProfile.memberId}`}
                  name={`${leaderProfile.firstName} ${leaderProfile.lastName}`}
                  email={leaderProfile.email}
                  badges={
                    <Badge variant="secondary" className="text-[10px]">
                      Leader
                    </Badge>
                  }
                />
              )}
              {members.map((row) => {
                const isLeader = leaderMemberId === row.member.memberId;
                return (
                  <PersonRow
                    key={row.labAppId}
                    name={`${row.member.firstName} ${row.member.lastName}`}
                    email={row.member.email}
                    meta={`Applied ${formatDate(row.appliedAt)}`}
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
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Applicants ({applicants.length})
          </h3>
          {applicants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pending applications.</p>
          ) : (
            <ul className="space-y-2">
              {applicants.map((row) => (
                <PersonRow
                  key={row.labAppId}
                  name={`${row.member.firstName} ${row.member.lastName}`}
                  email={row.member.email}
                  meta={`Applied ${formatDate(row.appliedAt)}`}
                />
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
