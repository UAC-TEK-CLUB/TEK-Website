import { prisma } from "@/lib/prisma";
import { isSiteAdmin, requireMember } from "@/lib/permissions";
import { BulletinFeed } from "@/components/community/BulletinFeed";
import { NewPostDialog } from "@/components/community/NewPostDialog";

export default async function BulletinPage() {
  const me = await requireMember();
  const posts = await prisma.bulletinPost.findMany({
    where: { labId: null },
    include: {
      author: true,
      lab: { select: { labName: true } },
    },
    orderBy: [{ pinned: "desc" }, { postedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="text-2xl font-bold">Bulletin board</h1>
          <p className="text-sm text-muted-foreground">
            Club-wide posts from the president and supervisors. Lab leader updates live on each
            lab&apos;s page for approved lab members.
            <br />
            All members can read; only executives can post here.
          </p>
        </div>
        {isSiteAdmin(me) && (
          <div className="shrink-0 self-start">
            <NewPostDialog />
          </div>
        )}
      </div>

      <BulletinFeed
        posts={posts}
        currentMemberId={me.memberId}
        isSiteAdmin={isSiteAdmin(me)}
      />
    </div>
  );
}
