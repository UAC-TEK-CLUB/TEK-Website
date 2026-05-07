"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { scheduleTutoring } from "@/server/actions/community";

type MemberOption = { memberId: string; firstName: string; lastName: string };

export function TutoringScheduler({ members }: { members: MemberOption[] }) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await scheduleTutoring({
          studentId,
          subject: formData.get("subject"),
          scheduledAt: formData.get("scheduledAt"),
          durationMins: formData.get("durationMins"),
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not schedule.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Offer tutoring
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a tutoring session</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a student" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.memberId} value={m.memberId}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" required placeholder="e.g. Data Structures" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">When</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMins">Duration (mins)</Label>
              <Input
                id="durationMins"
                name="durationMins"
                type="number"
                min={15}
                max={240}
                defaultValue={60}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending || !studentId}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
