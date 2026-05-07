import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

type Thread = {
  peer: { memberId: string; firstName: string; lastName: string };
  lastMessage: string;
  lastAt: Date;
  unread: number;
};

export function ChatList({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <Link key={t.peer.memberId} href={`/messages/${t.peer.memberId}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-3">
              <Avatar>
                <AvatarFallback>{initials(t.peer.firstName, t.peer.lastName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium">
                  {t.peer.firstName} {t.peer.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t.lastMessage}</p>
              </div>
              {t.unread > 0 && <Badge>{t.unread}</Badge>}
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
