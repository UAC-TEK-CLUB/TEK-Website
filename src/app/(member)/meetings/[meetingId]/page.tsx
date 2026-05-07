import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceCheckin } from "@/components/meetings/AttendanceCheckin";
import { formatDateTime } from "@/lib/utils";

export default async function MemberMeetingDetail({
  params,
}: {
  params: { meetingId: string };
}) {
  const me = await requireMember();
  const meeting = await prisma.meeting.findUnique({
    where: { meetingId: params.meetingId },
  });
  if (!meeting) notFound();

  const myRecord = await prisma.attendanceRecord.findUnique({
    where: {
      meetingId_memberId: {
        meetingId: meeting.meetingId,
        memberId: me.memberId,
      },
    },
  });

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{meeting.title}</CardTitle>
            <Badge>{meeting.type.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> {formatDateTime(meeting.scheduledAt)}
          </p>
          {meeting.location && (
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {meeting.location}
            </p>
          )}
          <div className="pt-3">
            <AttendanceCheckin
              meetingId={meeting.meetingId}
              memberId={me.memberId}
              currentStatus={myRecord?.attendanceStatus ?? null}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
