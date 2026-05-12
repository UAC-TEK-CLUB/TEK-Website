"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/server/actions/community";
import { uploadMemberImageFile } from "@/lib/client/memberImageUpload";

export function LabAnnouncementForm({ labId }: { labId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        let content = String(formData.get("content") || "");
        const file = fileRef.current?.files?.[0];
        if (file && file.size > 0) {
          const url = await uploadMemberImageFile(file, "lab-announcement");
          content = `![](${url})\n\n${content}`;
        }
        await createPost({
          title: formData.get("title"),
          content,
          labId,
        });
        if (fileRef.current) fileRef.current.value = "";
        form.reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not post.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-medium">Post a lab announcement</p>
      <p className="text-xs text-muted-foreground">
        Shown on this lab&apos;s public page for approved lab members, you, and executives — not on
        the main bulletin board. Optionally attach one image (shown at the top of the post).
      </p>
      <div className="space-y-2">
        <Label htmlFor={`lab-ann-title-${labId}`}>Title</Label>
        <Input id={`lab-ann-title-${labId}`} name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`lab-ann-image-${labId}`}>Image (optional)</Label>
        <Input
          id={`lab-ann-image-${labId}`}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="cursor-pointer sm:max-w-md"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`lab-ann-body-${labId}`}>Content</Label>
        <Textarea id={`lab-ann-body-${labId}`} name="content" rows={4} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Publish
      </Button>
    </form>
  );
}
