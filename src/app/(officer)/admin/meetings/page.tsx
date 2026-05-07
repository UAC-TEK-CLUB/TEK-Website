import { listAllMeetings } from "@/server/actions/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { MeetingList } from "@/components/meetings/MeetingList";

export default async function AdminMeetingsPage() {
  const meetings = await listAllMeetings();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage meetings</h1>
          <p className="text-sm text-muted-foreground">
            Schedule meetings and record attendance.
          </p>
        </div>
        <MeetingForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingList meetings={meetings} hrefPrefix="/admin/meetings" />
        </CardContent>
      </Card>
    </div>
  );
}
