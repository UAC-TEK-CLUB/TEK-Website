"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { GalleryPhotoBundleLimited } from "@/lib/galleryBundles";

export function GalleryHighlights({ bundles }: { bundles: GalleryPhotoBundleLimited[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const openBundle = openKey ? bundles.find((b) => b.key === openKey) : null;

  if (bundles.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No gallery photos yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {bundles.map((bundle) => {
          const first = bundle.photos[0];
          const second = bundle.photos[1];
          const third = bundle.photos[2];
          const countLabel =
            bundle.totalPhotoCount === bundle.photos.length
              ? `${bundle.totalPhotoCount} photo${bundle.totalPhotoCount === 1 ? "" : "s"}`
              : `${bundle.totalPhotoCount} photos · showing ${bundle.photos.length}`;
          return (
            <button
              key={bundle.key}
              type="button"
              onClick={() => setOpenKey(bundle.key)}
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
                    {first.uploader.firstName} {first.uploader.lastName} · {formatDate(bundle.latestAt)}
                  </p>
                  <p className="text-white/80">{countLabel}</p>
                </div>
                <ChevronDown className="absolute right-2 top-2 h-4 w-4 rounded-full bg-black/40 p-0.5 text-white" />
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!openBundle} onOpenChange={(open) => !open && setOpenKey(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto">
          {openBundle && (
            <>
              <DialogHeader>
                <DialogTitle>{openBundle.label}</DialogTitle>
                <DialogDescription>
                  {openBundle.photos[0].uploader.firstName} {openBundle.photos[0].uploader.lastName} ·{" "}
                  {formatDate(openBundle.latestAt)}
                  {openBundle.totalPhotoCount > openBundle.photos.length
                    ? ` · Showing ${openBundle.photos.length} of ${openBundle.totalPhotoCount} (same caption)`
                    : null}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {openBundle.photos.map((p) => (
                  <div key={p.photoId} className="overflow-hidden rounded-md border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption ?? openBundle.label}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="border-t bg-background/95 p-2 text-[11px] text-muted-foreground">
                      {formatDate(p.uploadedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
