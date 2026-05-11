"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
} as const;

export function LabRosterTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
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
        {rows.map((row) => (
          <TableRow key={row.labAppId}>
            <TableCell>
              <p className="font-medium">
                {row.member.firstName} {row.member.lastName}
              </p>
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
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await decideLabApplication({
                          labAppId: row.labAppId,
                          decision: "APPROVED",
                        });
                        router.refresh();
                      })
                    }
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await decideLabApplication({
                          labAppId: row.labAppId,
                          decision: "REJECTED",
                        });
                        router.refresh();
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
