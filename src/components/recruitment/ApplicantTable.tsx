import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ApprovalControls } from "@/components/recruitment/ApprovalControls";
import { ResendSetupLinkControls } from "@/components/recruitment/ResendSetupLinkControls";
import { formatDate } from "@/lib/utils";
import type { Applicant, ClubApplication, Visitor } from "@prisma/client";

type Row = ClubApplication & { applicant: Applicant; visitor: Visitor | null };

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
} as const;

export function ApplicantTable({
  rows,
  registeredUniversityIds = [],
}: {
  rows: Row[];
  /** Applicants who already have a Member row (finished /register). */
  registeredUniversityIds?: string[];
}) {
  const registered = new Set(registeredUniversityIds);
  if (rows.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No applications match this filter.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>Major</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.clubAppId}>
            <TableCell>
              <p className="font-medium">
                {row.applicant.firstName} {row.applicant.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.applicant.universityId} · {row.applicant.email}
              </p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground line-clamp-2">
                {row.codingExperience}
              </p>
            </TableCell>
            <TableCell>{row.major}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(row.submittedAt)}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {row.status === "PENDING" ? (
                <ApprovalControls clubAppId={row.clubAppId} />
              ) : row.status === "APPROVED" && !registered.has(row.applicant.universityId) ? (
                <ResendSetupLinkControls clubAppId={row.clubAppId} />
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
