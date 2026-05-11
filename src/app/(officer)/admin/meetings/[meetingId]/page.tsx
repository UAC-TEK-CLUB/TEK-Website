import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSiteAdmin } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttendanceReport } from "@/components/meetings/AttendanceReport";
import { DeleteMeetingButton } from "@/components/meetings/DeleteMeetingButton";
import { EditMeetingDialog } from "@/components/meetings/EditMeetingDialog";
import { MeetingNotesBox } from "@/components/meetings/MeetingNotesBox";
import { formatDateTime } from "@/lib/utils";

export default async function AdminMeetingDetail({
  params,
}: {
  params: { meetingId: string };
}) {
  const user = await getCurrentUser();
  const siteAdmin = isSiteAdmin(user);
  const canDeleteMeeting = siteAdmin;
  const canEditMeeting = siteAdmin;

  const meeting = await prisma.meeting.findUnique({
    where: { meetingId: params.meetingId },
    include: { attendance: true },
  });
  if (!meeting) notFound();

  const members = await prisma.member.findMany({
    where: { membershipStatus: "ACTIVE" },
    orderBy: { lastName: "asc" },
  });

  const recordsByMember = new Map(meeting.attendance.map((r) => [r.memberId, r]));
  const rows = members.map((m) => ({
    member: m,
    record: recordsByMember.get(m.memberId),
  }));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/meetings">← All meetings</Link>
        </Button>
        {canEditMeeting && (
          <EditMeetingDialog
            meeting={{
              meetingId: meeting.meetingId,
              title: meeting.title,
              scheduledAtIso: meeting.scheduledAt.toISOString(),
              type: meeting.type,
              location: meeting.location,
              notes: meeting.notes,
            }}
          />
        )}
        {canDeleteMeeting && <DeleteMeetingButton meetingId={meeting.meetingId} />}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl">{meeting.title}</CardTitle>
            <Badge>{meeting.type.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {formatDateTime(meeting.scheduledAt)}
          </p>
          {meeting.location && (
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {meeting.location}
            </p>
          )}
          {meeting.notes && (
            <MeetingNotesBox notes={meeting.notes} meetingId={meeting.meetingId} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceReport meetingId={meeting.meetingId} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
