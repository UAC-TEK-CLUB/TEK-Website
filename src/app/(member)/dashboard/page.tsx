import Link from "next/link";
import { ArrowRight, CalendarDays, FlaskConical, Users } from "lucide-react";
import { requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/identity/RoleBadge";
import { MembershipStatusBadge } from "@/components/identity/MembershipStatusBadge";

export default async function DashboardPage() {
  const user = await requireMember();
  const member = await prisma.member.findUnique({
    where: { memberId: user.memberId },
    include: {
      officerProfile: true,
      mentor: true,
      mentees: true,
    },
  });
  if (!member) return null;

  const [upcomingMeetings, openLabApps, mentees] = await Promise.all([
    prisma.meeting.findMany({
      where: { scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.labApplication.count({
      where: { memberId: member.memberId, status: "PENDING" },
    }),
    prisma.member.count({ where: { mentorId: member.memberId } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {member.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex gap-2">
          <RoleBadge
            memberType={member.memberType}
            level={member.officerProfile?.adminAccessLevel}
          />
          <MembershipStatusBadge status={member.membershipStatus} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming meetings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingMeetings.length}</p>
            <Link
              href="/meetings"
              className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
            >
              View calendar <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending lab applications</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openLabApps}</p>
            <Link
              href="/labs"
              className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
            >
              Browse labs <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mentees}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {member.mentor
                ? `Your mentor is ${member.mentor.firstName} ${member.mentor.lastName}`
                : "No mentor assigned yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next meetings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meetings scheduled.</p>
          ) : (
            upcomingMeetings.map((m) => (
              <div
                key={m.meetingId}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.scheduledAt).toLocaleString()} · {m.type}
                  </p>
                </div>
                <Link href={`/meetings/${m.meetingId}`} className="text-sm text-primary hover:underline">
                  Details
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
