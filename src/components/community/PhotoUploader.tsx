"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { uploadMemberImageFile } from "@/lib/client/memberImageUpload";
import { uploadPhoto } from "@/server/actions/community";

export function PhotoUploader() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const files = Array.from(fileRef.current?.files ?? []).filter((f) => f.size > 0);
        if (files.length === 0) {
          setError("Choose at least one image from your device.");
          return;
        }
        const caption = (formData.get("caption") as string) || null;
        for (const file of files) {
          const url = await uploadMemberImageFile(file, "gallery");
          await uploadPhoto({
            url,
            caption,
          });
        }
        if (fileRef.current) fileRef.current.value = "";
        setOpen(false);
        router.refresh();
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
            Upload one or more JPEG, PNG, WebP, or GIF images from your device (up to 5 MB each).
            Production uses S3-compatible storage when configured; local dev saves under{" "}
            <code className="rounded bg-muted px-1 text-[11px]">/uploads</code>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gallery-file">From device</Label>
            <Input
              id="gallery-file"
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" name="caption" placeholder="Optional" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to gallery
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
