"use client";

import { useTransition } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deletePost, togglePinPost } from "@/server/actions/community";
import { formatDateTime, initials } from "@/lib/utils";
import type { BulletinPost, Member } from "@prisma/client";

type Row = BulletinPost & { author: Member };

export function BulletinFeed({
  posts,
  currentMemberId,
  isOfficer,
}: {
  posts: Row[];
  currentMemberId: string;
  isOfficer: boolean;
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
            <div className="flex items-center gap-2">
              {post.pinned && <Badge>Pinned</Badge>}
              {isOfficer && (
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
              {(post.authorId === currentMemberId || isOfficer) && (
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
          <CardContent className="whitespace-pre-wrap text-sm">
            {post.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
