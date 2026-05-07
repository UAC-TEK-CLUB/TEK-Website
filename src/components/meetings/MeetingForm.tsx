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
import { createMeeting } from "@/server/actions/meetings";

const TYPES = ["GENERAL", "WORKSHOP", "HACKATHON", "SOCIAL", "OFFICER_ONLY"] as const;

export function MeetingForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof TYPES)[number]>("GENERAL");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createMeeting({
          title: formData.get("title"),
          scheduledAt: formData.get("scheduledAt"),
          type,
          location: formData.get("location") || null,
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create meeting.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule meeting</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">When</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as (typeof TYPES)[number])}>
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
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Room or URL" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
