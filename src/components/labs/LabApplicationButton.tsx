"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyToLab } from "@/server/actions/labs";

export function LabApplicationButton({
  labId,
  currentStatus,
}: {
  labId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | null;
}) {
  const [pending, startTransition] = useTransition();

  if (currentStatus === "APPROVED") {
    return <Button disabled>You&apos;re a member</Button>;
  }

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          await applyToLab(labId);
        })
      }
      disabled={pending || currentStatus === "PENDING"}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {currentStatus === "PENDING" ? "Application pending" : "Apply to join"}
    </Button>
  );
}
