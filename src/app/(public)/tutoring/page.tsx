import { Video } from "lucide-react";
import { auth } from "@/lib/auth";
import { isSiteAdmin } from "@/lib/permissions";
import { listTutoringVideos } from "@/server/actions/community";
import { AddVideoDialog } from "@/components/community/AddVideoDialog";
import { VideoCard } from "@/components/community/VideoCard";

export default async function TutoringVideosPage() {
  const session = await auth();
  const canManageVideos = isSiteAdmin(session?.user ?? null);
  const videos = await listTutoringVideos();

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tutoring videos</h1>
          <p className="text-sm text-muted-foreground">
            Online lectures and tutorials curated by officers. Open to everyone —
            sign in as a member to access the rest of the portal.
          </p>
        </div>
        {canManageVideos && <AddVideoDialog />}
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Video className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No videos yet</p>
          <p className="text-sm text-muted-foreground">
            {canManageVideos
              ? 'Click "Add video" to share the first tutorial.'
              : "Check back soon — club officers will post tutorials here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.videoId} video={v} canManage={canManageVideos} />
          ))}
        </div>
      )}
    </div>
  );
}
