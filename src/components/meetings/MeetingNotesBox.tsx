import { StickyNote } from "lucide-react";
import { BulletinContent } from "@/components/community/BulletinContent";

export function MeetingNotesBox({
  notes,
  meetingId,
}: {
  notes: string;
  meetingId: string;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-muted/40 px-4 py-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
        <StickyNote className="h-3.5 w-3.5 text-primary" />
        Notes &amp; RSVP
      </p>
      <BulletinContent
        text={notes}
        linkKeyPrefix={`meeting-${meetingId}-notes`}
        className="text-sm text-muted-foreground"
      />
    </div>
  );
}
