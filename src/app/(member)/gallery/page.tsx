import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { PhotoUploader } from "@/components/community/PhotoUploader";
import { GalleryGrid } from "@/components/community/GalleryGrid";

export default async function GalleryPage() {
  const me = await requireMember();
  const photos = await prisma.galleryPhoto.findMany({
    include: { uploader: true },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Photos from meetings, hackathons, and lab demos.
          </p>
        </div>
        <PhotoUploader />
      </div>

      <GalleryGrid
        photos={photos}
        currentMemberId={me.memberId}
        isOfficer={me.memberType === "OFFICER"}
      />
    </div>
  );
}
