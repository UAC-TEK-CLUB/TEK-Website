"use client";

import { useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { decideLabProposal } from "@/server/actions/labs";
import { formatDate } from "@/lib/utils";
import type { LabProposal, Member } from "@prisma/client";

type Row = LabProposal & { proposedBy: Member };

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
} as const;

export function ProposalQueue({ rows }: { rows: Row[] }) {
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No proposals to review.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <Card key={p.proposalId}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{p.proposedName}</p>
                <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Proposed by {p.proposedBy.firstName} {p.proposedBy.lastName} ·{" "}
                {formatDate(p.proposedAt)}
              </p>
              <p className="mt-2 text-sm">{p.description}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium">Objective:</span> {p.objective}
              </p>
            </div>
            {p.status === "PENDING" && (
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      await decideLabProposal({
                        proposalId: p.proposalId,
                        decision: "APPROVED",
                      });
                    })
                  }
                  disabled={pending}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      await decideLabProposal({
                        proposalId: p.proposalId,
                        decision: "REJECTED",
                      });
                    })
                  }
                  disabled={pending}
                >
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
