"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePhoto } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";
import {
  bundleGalleryPhotosByCaption,
} from "@/lib/galleryBundles";
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
  const bundles = useMemo(() => bundleGalleryPhotosByCaption(photos), [photos]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Row | null>(null);

  useEffect(() => {
    setExpanded((prev) => {
      const valid = new Set(
        Array.from(prev).filter((key) => bundles.some((b) => b.key === key))
      );
      return valid;
    });
  }, [bundles]);

  if (photos.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No photos yet — upload the first one!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {bundles.map((bundle) => {
          const isOpen = expanded.has(bundle.key);
          const first = bundle.photos[0];
          const second = bundle.photos[1];
          const third = bundle.photos[2];
          return (
            <button
              key={bundle.key}
              type="button"
              onClick={() =>
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(bundle.key)) next.delete(bundle.key);
                  else next.add(bundle.key);
                  return next;
                })
              }
              className="group relative overflow-hidden rounded-md border bg-muted text-left"
            >
              <div className="relative aspect-square w-full bg-muted">
                {third && (
                  <div className="absolute inset-0 translate-x-2 translate-y-2 overflow-hidden rounded-md border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={third.url} alt="" className="h-full w-full object-cover opacity-70" />
                  </div>
                )}
                {second && (
                  <div className="absolute inset-0 translate-x-1 translate-y-1 overflow-hidden rounded-md border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={second.url} alt="" className="h-full w-full object-cover opacity-85" />
                  </div>
                )}
                <div className="absolute inset-0 overflow-hidden rounded-md border shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={first.url} alt={bundle.label} className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white">
                  <p className="line-clamp-2 font-medium">{bundle.label}</p>
                  <p className="text-white/80">
                    {bundle.photos.length} photo{bundle.photos.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronDown
                  className={`absolute right-2 top-2 h-4 w-4 rounded-full bg-black/40 p-0.5 text-white transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {bundles.map((bundle) => {
        if (!expanded.has(bundle.key)) return null;
        return (
          <section key={`${bundle.key}-expanded`} className="space-y-2 rounded-md border bg-muted/10 p-3">
            <p className="text-sm font-medium">
              {bundle.label} ({bundle.photos.length})
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {bundle.photos.map((p) => (
                <div key={p.photoId} className="group relative overflow-hidden rounded-md border bg-muted">
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => setPreview(p)}
                    aria-label="Open photo preview"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.caption ?? ""} className="aspect-square w-full object-cover" />
                  </button>
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
                          if (preview?.photoId === p.photoId) setPreview(null);
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
          </section>
        );
      })}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto p-4 sm:p-6">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {preview.caption?.trim() || "Gallery photo"}
                </DialogTitle>
                <DialogDescription>
                  {preview.uploader.firstName} {preview.uploader.lastName} · {formatDate(preview.uploadedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-md border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.caption ?? ""}
                  className="max-h-[72vh] w-full object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
