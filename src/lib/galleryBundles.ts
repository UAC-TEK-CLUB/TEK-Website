export type GalleryBundleUploader = { firstName: string; lastName: string };

/** Minimal fields needed to group gallery rows by caption. */
export type GalleryBundlePhoto = {
  photoId: string;
  url: string;
  caption: string | null;
  uploadedAt: Date;
  uploader: GalleryBundleUploader;
};

export type GalleryPhotoBundle<T extends GalleryBundlePhoto = GalleryBundlePhoto> = {
  key: string;
  label: string;
  latestAt: Date;
  photos: T[];
};

/** Group photos by trimmed caption (case-insensitive). Empty captions share one "uncaptioned" bucket. */
export function bundleGalleryPhotosByCaption<T extends GalleryBundlePhoto>(
  photos: T[]
): GalleryPhotoBundle<T>[] {
  const byKey = new Map<string, GalleryPhotoBundle<T>>();
  for (const p of photos) {
    const caption = (p.caption ?? "").trim();
    const key = caption ? `caption:${caption.toLowerCase()}` : "uncaptioned";
    const label = caption || "No caption";
    const existing = byKey.get(key);
    if (existing) {
      existing.photos.push(p);
      if (p.uploadedAt > existing.latestAt) existing.latestAt = p.uploadedAt;
    } else {
      byKey.set(key, {
        key,
        label,
        photos: [p],
        latestAt: p.uploadedAt,
      });
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => b.latestAt.getTime() - a.latestAt.getTime()
  );
}

export type GalleryPhotoBundleLimited<T extends GalleryBundlePhoto = GalleryBundlePhoto> =
  GalleryPhotoBundle<T> & {
    /** Full count in this caption group before capping for display. */
    totalPhotoCount: number;
  };

/** Newest-first per bundle, keep at most `maxPerBundle` photos for display. */
export function limitBundlePhotos<T extends GalleryBundlePhoto>(
  bundles: GalleryPhotoBundle<T>[],
  maxPerBundle: number
): GalleryPhotoBundleLimited<T>[] {
  return bundles.map((b) => {
    const sorted = [...b.photos].sort(
      (a, c) => c.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
    return {
      ...b,
      totalPhotoCount: sorted.length,
      photos: sorted.slice(0, maxPerBundle),
    };
  });
}
