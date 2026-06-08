"use client";

import { useState, useTransition } from "react";
import { Loader2, PlayCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/community/VideoPlayer";
import { deleteTutoringVideo } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";
import { parseVideoUrl } from "@/lib/videoEmbed";
import type { Member, TutoringVideo } from "@prisma/client";

type Row = TutoringVideo & { uploader: Member };

export function VideoCard({
  video,
  canManage,
  /** @deprecated Use canManage */
  isOfficer,
}: {
  video: Row;
  canManage?: boolean;
  isOfficer?: boolean;
}) {
  const allowManage = canManage ?? isOfficer ?? false;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const parsed = parseVideoUrl(video.videoUrl);

  return (
    <>
      <Card className="group overflow-hidden">
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => setOpen(true)}
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {parsed.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={parsed.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <PlayCircle className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
              <PlayCircle className="h-12 w-12 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>
        </button>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 font-semibold">{video.title}</p>
            <Badge variant="secondary">{video.provider}</Badge>
          </div>
          {video.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {video.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {video.uploader.firstName} {video.uploader.lastName} · {formatDate(video.createdAt)}
            </span>
            {allowManage && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={pending}
                onClick={(e) => {
                  e.stopPropagation();
                  startTransition(async () => {
                    await deleteTutoringVideo(video.videoId);
                  });
                }}
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{video.title}</DialogTitle>
          </DialogHeader>
          <VideoPlayer url={video.videoUrl} title={video.title} />
          {video.description && (
            <p className="text-sm text-muted-foreground">{video.description}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
