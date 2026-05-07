"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recordAttendance } from "@/server/actions/meetings";
import type { AttendanceStatus } from "@prisma/client";

const STATUS_VARIANT: Record<
  AttendanceStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "destructive",
  EXCUSED: "outline",
};

export function AttendanceCheckin({
  meetingId,
  memberId,
  currentStatus,
}: {
  meetingId: string;
  memberId: string;
  currentStatus: AttendanceStatus | null;
}) {
  const [pending, startTransition] = useTransition();

  if (currentStatus === "PRESENT") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_VARIANT.PRESENT}>Checked in</Badge>
        <Check className="h-4 w-4 text-emerald-600" />
      </div>
    );
  }

  if (currentStatus) {
    return <Badge variant={STATUS_VARIANT[currentStatus]}>{currentStatus}</Badge>;
  }

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          await recordAttendance({
            meetingId,
            memberId,
            status: "PRESENT",
          });
        })
      }
      disabled={pending}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
      Check in
    </Button>
  );
}
