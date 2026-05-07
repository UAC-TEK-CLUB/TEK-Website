import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutoringScheduler } from "@/components/community/TutoringScheduler";
import { TutoringSessionList } from "@/components/community/TutoringSessionList";

export default async function TutoringPage() {
  const me = await requireMember();

  const [sessions, members] = await Promise.all([
    prisma.tutoringSession.findMany({
      where: {
        OR: [{ tutorId: me.memberId }, { studentId: me.memberId }],
      },
      include: { tutor: true, student: true },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE", NOT: { memberId: me.memberId } },
      select: { memberId: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  const upcoming = sessions.filter((s) => s.status === "SCHEDULED");
  const past = sessions.filter((s) => s.status !== "SCHEDULED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutoring</h1>
          <p className="text-sm text-muted-foreground">
            Offer your expertise or get help from a peer.
          </p>
        </div>
        <TutoringScheduler members={members} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <TutoringSessionList rows={upcoming} meId={me.memberId} />
            </TabsContent>
            <TabsContent value="past">
              <TutoringSessionList rows={past} meId={me.memberId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
