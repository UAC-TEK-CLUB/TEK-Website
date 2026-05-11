"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteLabSpotlightProject,
  upsertLabSpotlightProject,
} from "@/server/actions/projects";

type Existing = {
  projectId: string;
  title: string;
  description: string;
  photoUrl: string;
};

export function LeaderProjectForm({
  labId,
  existing,
}: {
  labId: string;
  existing?: Existing | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await upsertLabSpotlightProject({
          labId,
          title: formData.get("title"),
          description: formData.get("description"),
          photoUrl: formData.get("photoUrl"),
        });
        setSuccess(existing ? "Spotlight updated." : "Spotlight published.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save project.");
      }
    });
  }

  function onDelete() {
    if (!existing) return;
    if (!window.confirm("Remove this lab spotlight from the homepage?")) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await deleteLabSpotlightProject({ projectId: existing.projectId });
        setSuccess("Spotlight removed.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete project.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={existing?.title}
          placeholder="e.g. AI Contents Lab – Campus Creator Toolkit"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photoUrl">Project photo URL</Label>
        <Input
          id="photoUrl"
          name="photoUrl"
          type="url"
          required
          defaultValue={existing?.photoUrl}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={3000}
          rows={5}
          defaultValue={existing?.description}
          placeholder="What your team is building, who it's for, and current progress..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-primary">{success}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existing ? "Update spotlight" : "Publish spotlight"}
        </Button>
        {existing && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
