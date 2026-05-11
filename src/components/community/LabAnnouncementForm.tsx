"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/server/actions/community";

export function LabAnnouncementForm({ labId }: { labId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createPost({
          title: formData.get("title"),
          content: formData.get("content"),
          labId,
        });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not post.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-medium">Post a lab announcement</p>
      <p className="text-xs text-muted-foreground">
        Shown on this lab&apos;s public page for approved lab members, you, and executives — not on
        the main bulletin board.
      </p>
      <div className="space-y-2">
        <Label htmlFor={`lab-ann-title-${labId}`}>Title</Label>
        <Input id={`lab-ann-title-${labId}`} name="title" required />
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
