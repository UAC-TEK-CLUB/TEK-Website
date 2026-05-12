import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { canModerateGalleryDeletes } from "@/lib/galleryAccess";
import { PhotoUploader } from "@/components/community/PhotoUploader";
import { GalleryGrid } from "@/components/community/GalleryGrid";

export default async function GalleryPage() {
  const me = await requireMember();
  const [photos, canDeleteAny] = await Promise.all([
    prisma.galleryPhoto.findMany({
      include: { uploader: true },
      orderBy: { uploadedAt: "desc" },
    }),
    canModerateGalleryDeletes(me),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Photos from meetings, hackathons, and lab demos. Upload from your device (JPEG/PNG/WebP/GIF,
            up to 5 MB) or paste an image link. Club executives and lab leaders can remove any upload.
          </p>
        </div>
        <PhotoUploader />
      </div>

      <GalleryGrid
        photos={photos}
        currentMemberId={me.memberId}
        canDeleteAnyPhoto={canDeleteAny}
      />
    </div>
  );
}
