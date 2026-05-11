import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSiteAdmin } from "@/lib/permissions";
import { getLabAnnouncementsForLabPage } from "@/server/actions/community";
import { getLabRosterForPublicPage } from "@/server/actions/labs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabApplicationButton } from "@/components/labs/LabApplicationButton";
import { BulletinFeed } from "@/components/community/BulletinFeed";
import { LabPublicRoster } from "@/components/labs/LabPublicRoster";
import { cn, formatDate } from "@/lib/utils";

export default async function LabDetailPage({
  params,
}: {
  params: { labId: string };
}) {
  const lab = await prisma.lab.findUnique({
    where: { labId: params.labId },
    include: {
      spotlight: true,
      leader: {
        select: { memberId: true, firstName: true, lastName: true, email: true },
      },
    },
  });
  if (!lab) notFound();

  const session = await auth();
  const viewer = session?.user
    ? {
        memberId: session.user.memberId,
        memberType: session.user.memberType,
        officerRole: session.user.officerRole,
      }
    : null;
  const [labAnnouncements, rosterRows] = await Promise.all([
    getLabAnnouncementsForLabPage(lab.labId, viewer),
    getLabRosterForPublicPage(lab.labId, viewer),
  ]);

  let myApplicationStatus: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | null = null;
  if (session?.user) {
    const application = await prisma.labApplication.findUnique({
      where: {
        memberId_labId: {
          memberId: session.user.memberId,
          labId: lab.labId,
        },
      },
    });
    myApplicationStatus = application?.status ?? null;
  }

  const isAssignedLabLeader =
    !!session?.user &&
    lab.leaderMemberId != null &&
    lab.leaderMemberId === session.user.memberId;

  const showRoster = rosterRows !== null;

  const mainColumn = (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{lab.labName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{lab.description}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Objective:</span> {lab.objective}
          </p>
          {myApplicationStatus && !isAssignedLabLeader && (
            <div className="flex items-center gap-2 text-sm">
              <span>Your status:</span>
              <Badge>{myApplicationStatus}</Badge>
            </div>
          )}
          {session?.user ? (
            isAssignedLabLeader ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">You are assigned as the leader of this lab.</p>
                <Button asChild variant="outline">
                  <Link href={`/member/labs/${lab.labId}/manage`}>Open lab console</Link>
                </Button>
              </div>
            ) : (
              <LabApplicationButton labId={lab.labId} currentStatus={myApplicationStatus} />
            )
          ) : (
            <Button asChild>
              <Link href="/login">Sign in to apply</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {lab.spotlight && (
        <Card className="overflow-hidden">
          <div className="relative aspect-video w-full max-h-64 bg-muted md:max-h-80">
            <Image
              src={lab.spotlight.photoUrl}
              alt={lab.spotlight.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 48rem"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{lab.spotlight.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Lab spotlight · Updated {formatDate(lab.spotlight.updatedAt)}
            </p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="whitespace-pre-wrap">{lab.spotlight.description}</p>
          </CardContent>
        </Card>
      )}

      {labAnnouncements !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lab announcements</CardTitle>
            <p className="text-sm text-muted-foreground">
              Updates from your lab leader. This section is only visible to approved members of this
              lab, the lab leader, and club executives.
            </p>
          </CardHeader>
          <CardContent>
            {labAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <BulletinFeed
                posts={labAnnouncements}
                currentMemberId={session!.user.memberId}
                isSiteAdmin={isSiteAdmin(session!.user)}
                hideLabBadge
              />
            )}
          </CardContent>
        </Card>
      )}

      {labAnnouncements === null && session?.user && (
        <p className="text-sm text-muted-foreground">
          Lab leader announcements appear here once you are approved for this lab (or if you lead
          this lab).
        </p>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "container py-12",
        showRoster ? "max-w-6xl" : "max-w-3xl"
      )}
    >
      <div
        className={cn(
          showRoster && "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,20rem)] lg:items-start"
        )}
      >
        <div>{mainColumn}</div>
        {showRoster && rosterRows && (
          <aside className="min-w-0">
            <LabPublicRoster
              rows={rosterRows}
              leaderMemberId={lab.leaderMemberId}
              leaderProfile={lab.leader}
            />
          </aside>
        )}
      </div>

      {!showRoster && session?.user && (
        <p className="mt-6 text-sm text-muted-foreground">
          The member and applicant roster appears here once you are approved for this lab, are the
          lab leader, have a pending application, or are a club executive.
        </p>
      )}
    </div>
  );
}
