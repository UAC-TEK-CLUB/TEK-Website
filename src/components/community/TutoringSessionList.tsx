"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelTutoring, completeTutoring } from "@/server/actions/community";
import { formatDateTime } from "@/lib/utils";
import type { Member, TutoringSession, TutoringStatus } from "@prisma/client";

type Row = TutoringSession & {
  tutor: Member;
  student: Member;
};

const STATUS_VARIANT: Record<TutoringStatus, "default" | "success" | "destructive" | "outline"> = {
  SCHEDULED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export function TutoringSessionList({
  rows,
  meId,
}: {
  rows: Row[];
  meId: string;
}) {
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No sessions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((s) => {
        const meIsTutor = s.tutorId === meId;
        return (
          <Card key={s.sessionId}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.subject}</p>
                  <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                  <Badge variant="outline">{meIsTutor ? "Tutor" : "Student"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(s.scheduledAt)} · {s.durationMins} min
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tutor: {s.tutor.firstName} {s.tutor.lastName} · Student:{" "}
                  {s.student.firstName} {s.student.lastName}
                </p>
              </div>
              {s.status === "SCHEDULED" && (
                <div className="flex gap-2">
                  {meIsTutor && (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await completeTutoring(s.sessionId);
                        })
                      }
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await cancelTutoring(s.sessionId);
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
