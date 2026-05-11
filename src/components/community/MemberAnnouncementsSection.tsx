import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { BulletinContent } from "@/components/community/BulletinContent";
import type { BulletinPost } from "@prisma/client";

type Row = BulletinPost & {
  author: { firstName: string; lastName: string };
  lab?: { labName: string } | null;
};

export function MemberAnnouncementsSection({
  posts,
  heading = "Club announcements",
}: {
  posts: Row[];
  heading?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <CardTitle className="text-base">{heading}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Club-wide bulletin highlights. Pinned items appear first. Lab-only updates are on each
              lab&apos;s page.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/bulletin">Bulletin</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="rounded-lg border bg-background/80 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium leading-snug">{post.title}</h3>
              {post.lab && (
                <Badge variant="outline" className="text-xs">
                  Lab: {post.lab.labName}
                </Badge>
              )}
              {post.pinned && <Badge variant="secondary">Pinned</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {post.author.firstName} {post.author.lastName} ·{" "}
              {formatDateTime(post.postedAt)}
            </p>
            <div className="mt-2 line-clamp-4 text-sm text-muted-foreground">
              <BulletinContent text={post.content} linkKeyPrefix={post.postId} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
