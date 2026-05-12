"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteLabSpotlightProject,
  upsertLabSpotlightProject,
} from "@/server/actions/projects";
import { uploadMemberImageFile } from "@/lib/client/memberImageUpload";

type Existing = {
  projectId: string;
  title: string;
  description: string;
  photoUrl: string;
  websiteUrl: string | null;
};

export function LeaderProjectForm({
  labId,
  existing,
}: {
  labId: string;
  existing?: Existing | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const file = fileRef.current?.files?.[0];
        let finalPhotoUrl = photoUrl.trim();
        if (file && file.size > 0) {
          finalPhotoUrl = await uploadMemberImageFile(file, "spotlight");
          setPhotoUrl(finalPhotoUrl);
          if (fileRef.current) fileRef.current.value = "";
        }
        if (!finalPhotoUrl) {
          setError("Choose an image file for the spotlight (JPEG, PNG, WebP, or GIF, up to 5 MB).");
          return;
        }
        await upsertLabSpotlightProject({
          labId,
          title: formData.get("title"),
          description: formData.get("description"),
          photoUrl: finalPhotoUrl,
          websiteUrl: String(formData.get("websiteUrl") ?? ""),
        });
        setSuccess(existing ? "Spotlight updated." : "Spotlight published.");
        router.refresh();
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
        setPhotoUrl("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete project.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <Label htmlFor="spotlight-file">Project photo — from device</Label>
        <Input
          id="spotlight-file"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="cursor-pointer sm:max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF — up to 5 MB. Uses S3 when configured; otherwise dev saves under{" "}
          <code className="rounded bg-muted px-1">/uploads</code>.
          {existing?.photoUrl && (
            <>
              {" "}
              Leave empty to keep the current image when you only change title or description.
            </>
          )}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Project website (optional)</Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          inputMode="url"
          maxLength={2048}
          defaultValue={existing?.websiteUrl ?? ""}
          placeholder="https://example.com or https://github.com/org/repo"
        />
        <p className="text-xs text-muted-foreground">
          Shown as an external link on the homepage spotlight and your public lab page. Use a full{" "}
          <code className="rounded bg-muted px-1">https://</code> address.
        </p>
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
          <Button type="button" variant="outline" disabled={pending} onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
