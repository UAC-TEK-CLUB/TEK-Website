import { listAllMeetings } from "@/server/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingList } from "@/components/meetings/MeetingList";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { isSiteAdmin, requireMember } from "@/lib/permissions";
import { getAttendanceStats } from "@/server/actions/meetings";

export default async function MemberMeetingsPage() {
  const me = await requireMember();
  const meetings = await listAllMeetings();
  const now = new Date();
  const upcoming = meetings.filter((m) => m.scheduledAt >= now).reverse();
  const past = meetings.filter((m) => m.scheduledAt < now);
  const stats = await getAttendanceStats(me.memberId);
  const siteAdmin = isSiteAdmin(me);
  const meetingDetailPrefix = siteAdmin ? "/admin/meetings" : "/meetings";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            RSVP to upcoming gatherings and review your attendance history.
          </p>
        </div>
        {siteAdmin && <MeetingForm />}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Present", value: stats.present },
          { label: "Late", value: stats.late },
          { label: "Absent", value: stats.absent },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <MeetingList meetings={upcoming} hrefPrefix={meetingDetailPrefix} />
        </TabsContent>
        <TabsContent value="past">
          <MeetingList meetings={past} hrefPrefix={meetingDetailPrefix} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
