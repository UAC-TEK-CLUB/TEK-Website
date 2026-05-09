"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMeeting } from "@/server/actions/meetings";

export function DeleteMeetingButton({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        "Delete this meeting and its attendance records? This cannot be undone."
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteMeeting(meetingId);
        router.push("/admin/meetings");
        router.refresh();
      } catch {
        window.alert(
          "You don't have permission to delete meetings, or something went wrong."
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={onDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete meeting
    </Button>
  );
}
