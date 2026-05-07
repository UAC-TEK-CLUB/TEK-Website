"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLab } from "@/server/actions/labs";

export function CreateLabForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createLab({
          labName: formData.get("labName"),
          description: formData.get("description"),
          objective: formData.get("objective"),
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create lab.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New lab
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create lab</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labName">Name</Label>
            <Input id="labName" name="labName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Textarea id="objective" name="objective" rows={2} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
