"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePhoto } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";
import type { GalleryPhoto, Member } from "@prisma/client";

type Row = GalleryPhoto & { uploader: Member };

export function GalleryGrid({
  photos,
  currentMemberId,
  canDeleteAnyPhoto,
}: {
  photos: Row[];
  currentMemberId: string;
  /** Executives or lab leaders — may remove any upload. */
  canDeleteAnyPhoto: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (photos.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No photos yet — upload the first one!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((p) => (
        <div key={p.photoId} className="group relative overflow-hidden rounded-md border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white">
            <p className="font-medium">
              {p.uploader.firstName} {p.uploader.lastName}
            </p>
            <p className="text-white/80">{formatDate(p.uploadedAt)}</p>
            {p.caption && <p className="mt-1 line-clamp-2">{p.caption}</p>}
          </div>
          {(p.uploaderId === currentMemberId || canDeleteAnyPhoto) && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deletePhoto(p.photoId);
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
