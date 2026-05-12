"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ApproveDecisionButton,
  RejectDecisionButton,
} from "@/components/common/ReviewDecisionButtons";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { decideLabApplication } from "@/server/actions/labs";
import { formatDate } from "@/lib/utils";
import type { LabApplication, Member, ClubOfficer } from "@prisma/client";

type Row = LabApplication & {
  member: Member & { officerProfile: ClubOfficer | null };
};

export type LabRosterLeader = {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
};

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
} as const;

export function LabRosterTable({
  rows,
  leaders = [],
}: {
  rows: Row[];
  leaders?: LabRosterLeader[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const leaderSet = new Set(leaders.map((l) => l.memberId));
  const memberIdsWithApplication = new Set(rows.map((r) => r.member.memberId));
  const leadersNotInApplications = leaders.filter((l) => !memberIdsWithApplication.has(l.memberId));

  const showEmpty = rows.length === 0 && leadersNotInApplications.length === 0;

  if (showEmpty) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No applications yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leadersNotInApplications.map((leader) => (
          <TableRow key={`leader-${leader.memberId}`}>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  {leader.firstName} {leader.lastName}
                </p>
                <Badge variant="secondary" className="text-[10px]">
                  Leader
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{leader.email}</p>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">—</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Assigned leader
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-xs text-muted-foreground">—</span>
            </TableCell>
          </TableRow>
        ))}
        {rows.map((row) => (
          <TableRow key={row.labAppId}>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  {row.member.firstName} {row.member.lastName}
                </p>
                {leaderSet.has(row.member.memberId) && (
                  <Badge variant="secondary" className="text-[10px]">
                    Leader
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{row.member.email}</p>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(row.appliedAt)}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {row.status === "PENDING" ? (
                <div className="flex justify-end gap-2">
                  <RejectDecisionButton
                    showLabel={false}
                    disabled={pending}
                    aria-label="Reject application"
                    title="Reject"
                    onClick={() =>
                      startTransition(async () => {
                        await decideLabApplication({
                          labAppId: row.labAppId,
                          decision: "REJECTED",
                        });
                        router.refresh();
                      })
                    }
                  />
                  <ApproveDecisionButton
                    showLabel={false}
                    disabled={pending}
                    aria-label="Approve application"
                    title="Approve"
                    onClick={() =>
                      startTransition(async () => {
                        await decideLabApplication({
                          labAppId: row.labAppId,
                          decision: "APPROVED",
                        });
                        router.refresh();
                      })
                    }
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
