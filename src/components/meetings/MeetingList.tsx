import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { Meeting } from "@prisma/client";

type Row = Meeting & { _count?: { attendance: number } };

export function MeetingList({
  meetings,
  hrefPrefix = "/meetings",
}: {
  meetings: Row[];
  hrefPrefix?: string;
}) {
  if (meetings.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No meetings.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <Card key={m.meetingId}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.title}</p>
                <Badge variant="secondary">{m.type.replace("_", " ")}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> {formatDateTime(m.scheduledAt)}
                </span>
                {m.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {m.location}
                  </span>
                )}
                {typeof m._count?.attendance === "number" && (
                  <span>{m._count.attendance} recorded</span>
                )}
              </div>
            </div>
            <Link
              href={`${hrefPrefix}/${m.meetingId}`}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Details <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
