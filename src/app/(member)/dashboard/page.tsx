import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Crown,
  FlaskConical,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { isExecutive, requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/identity/RoleBadge";
import { MembershipStatusBadge } from "@/components/identity/MembershipStatusBadge";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { fullName, formatDate } from "@/lib/utils";

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

  const isOfficer = member.memberType === "OFFICER";
  const executive = isExecutive(user);

  const [upcomingMeetings, openLabApps, mentees, pendingApplicants, recentPending] =
    await Promise.all([
      prisma.meeting.findMany({
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      prisma.labApplication.count({
        where: { memberId: member.memberId, status: "PENDING" },
      }),
      prisma.member.count({ where: { mentorId: member.memberId } }),
      executive
        ? prisma.clubApplication.count({ where: { status: "PENDING" } })
        : Promise.resolve(0),
      executive
        ? prisma.clubApplication.findMany({
            where: { status: "PENDING" },
            include: { applicant: true },
            orderBy: { submittedAt: "asc" },
            take: 5,
          })
        : Promise.resolve([]),
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
            officerRole={member.officerProfile?.officerRole}
            level={member.officerProfile?.adminAccessLevel}
          />
          <MembershipStatusBadge status={member.membershipStatus} />
        </div>
      </div>

      {executive && (
        <Card className="border-red-200/80 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Pending applications
              </CardTitle>
            </div>
            <Badge variant="secondary">{pendingApplicants}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPending.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing waiting for review right now.
              </p>
            ) : (
              <div className="space-y-2">
                {recentPending.map((app) => (
                  <div
                    key={app.clubAppId}
                    className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {fullName(app.applicant.firstName, app.applicant.lastName)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.major} · {app.applicant.universityId} · submitted {formatDate(app.submittedAt)}
                      </p>
                    </div>
                    <Link
                      href="/admin/applicants"
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/applicants">
                  Open application queue
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isOfficer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Officer quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <MeetingForm />
            {executive && (
              <Button asChild variant="outline">
                <Link href="/admin/applicants">
                  <Users className="mr-2 h-4 w-4" />
                  Review applicants
                  {pendingApplicants > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {pendingApplicants}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/meetings">
                <CalendarDays className="mr-2 h-4 w-4" />
                Manage meetings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tutoring">
                <Video className="mr-2 h-4 w-4" />
                Add tutoring video
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/proposals">
                <Plus className="mr-2 h-4 w-4" />
                Lab proposals
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
