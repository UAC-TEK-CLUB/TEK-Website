import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { BulletinFeed } from "@/components/community/BulletinFeed";
import { NewPostDialog } from "@/components/community/NewPostDialog";

export default async function BulletinPage() {
  const me = await requireMember();
  const posts = await prisma.bulletinPost.findMany({
    include: { author: true },
    orderBy: [{ pinned: "desc" }, { postedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulletin board</h1>
          <p className="text-sm text-muted-foreground">
            Announcements from members and officers.
          </p>
        </div>
        <NewPostDialog />
      </div>

      <BulletinFeed
        posts={posts}
        currentMemberId={me.memberId}
        isOfficer={me.memberType === "OFFICER"}
      />
    </div>
  );
}
