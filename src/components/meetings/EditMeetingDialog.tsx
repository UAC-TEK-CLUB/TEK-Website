"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import type { MeetingType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateMeeting } from "@/server/actions/meetings";
import { toDatetimeLocalInputValue } from "@/lib/utils";

const TYPES: MeetingType[] = [
  "GENERAL",
  "WORKSHOP",
  "HACKATHON",
  "SOCIAL",
  "SHOWCASE",
  "OFFICER_ONLY",
];

export type EditableMeetingSnapshot = {
  meetingId: string;
  title: string;
  scheduledAtIso: string;
  type: MeetingType;
  location: string | null;
  notes: string | null;
};

export function EditMeetingDialog({ meeting }: { meeting: EditableMeetingSnapshot }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [scheduledAt, setScheduledAt] = useState("");
  const [type, setType] = useState<MeetingType>(meeting.type);
  const [location, setLocation] = useState(meeting.location ?? "");
  const [notes, setNotes] = useState(meeting.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(meeting.title);
    setType(meeting.type);
    setLocation(meeting.location ?? "");
    setNotes(meeting.notes ?? "");
    setScheduledAt(toDatetimeLocalInputValue(meeting.scheduledAtIso));
    setError(null);
  }, [open, meeting]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateMeeting({
          meetingId: meeting.meetingId,
          title,
          scheduledAt,
          type,
          location: location.trim() || null,
          notes: notes.trim() || undefined,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update meeting.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-title-${meeting.meetingId}`}>Title</Label>
            <Input
              id={`edit-title-${meeting.meetingId}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-when-${meeting.meetingId}`}>When</Label>
            <Input
              id={`edit-when-${meeting.meetingId}`}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MeetingType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-location-${meeting.meetingId}`}>Location</Label>
            <Input
              id={`edit-location-${meeting.meetingId}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room or URL"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-notes-${meeting.meetingId}`}>Notes &amp; RSVP (optional)</Label>
            <Textarea
              id={`edit-notes-${meeting.meetingId}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="RSVP link, agenda doc, etc."
              maxLength={2000}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Shown to all members on the meeting page.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
