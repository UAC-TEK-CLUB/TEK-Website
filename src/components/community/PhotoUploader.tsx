"use client";

import { useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadPhoto } from "@/server/actions/community";

export function PhotoUploader() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await uploadPhoto({
          url: formData.get("url"),
          caption: formData.get("caption") || null,
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload photo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload to gallery</DialogTitle>
          <DialogDescription>
            Paste a public URL for now. The S3 presigned-upload flow will be wired in
            production (see Phase 5 plan note).
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Image URL</Label>
            <Input id="url" name="url" type="url" required placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" name="caption" placeholder="Optional" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
