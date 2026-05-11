"use client";

import { useTransition } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deletePost, togglePinPost } from "@/server/actions/community";
import { formatDateTime, initials } from "@/lib/utils";
import { BulletinContent } from "@/components/community/BulletinContent";
import type { BulletinPost, Member } from "@prisma/client";

type Row = BulletinPost & {
  author: Pick<Member, "firstName" | "lastName">;
  lab: { labName: string } | null;
};

export function BulletinFeed({
  posts,
  currentMemberId,
  isSiteAdmin,
  hideLabBadge,
}: {
  posts: Row[];
  currentMemberId: string;
  isSiteAdmin: boolean;
  /** When every post is already scoped to one lab page, hide the redundant lab name pill. */
  hideLabBadge?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Nothing posted yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.postId}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(post.author.firstName, post.author.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{post.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {post.author.firstName} {post.author.lastName} · {formatDateTime(post.postedAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!hideLabBadge && post.lab && (
                <Badge variant="outline" className="text-xs">
                  Lab: {post.lab.labName}
                </Badge>
              )}
              {post.pinned && <Badge>Pinned</Badge>}
              {isSiteAdmin && !post.labId && (
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await togglePinPost(post.postId);
                    })
                  }
                >
                  {post.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
              )}
              {(post.authorId === currentMemberId || isSiteAdmin) && (
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePost(post.postId);
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <BulletinContent text={post.content} linkKeyPrefix={post.postId} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
