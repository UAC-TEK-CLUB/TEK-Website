import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { canManageLabApplications } from "@/lib/labAccess";
import { getLabRoster } from "@/server/actions/labs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabRosterTable } from "@/components/labs/LabRosterTable";
import { LabAnnouncementForm } from "@/components/community/LabAnnouncementForm";
import { LeaderProjectForm } from "@/components/projects/LeaderProjectForm";

export default async function LabConsolePage({
  params,
}: {
  params: { labId: string };
}) {
  const me = await requireMember();
  if (!(await canManageLabApplications(me, params.labId))) {
    notFound();
  }

  const lab = await prisma.lab.findUnique({
    where: { labId: params.labId },
    include: {
      spotlight: {
        select: {
          projectId: true,
          title: true,
          description: true,
          photoUrl: true,
          websiteUrl: true,
        },
      },
      leaderAssignments: {
        include: {
          member: {
            select: { memberId: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });
  if (!lab) notFound();

  const roster = await getLabRoster(params.labId);
  const rosterLeaders = lab.leaderAssignments.map((a) => a.member);
  const memberIdsWithApplication = new Set(roster.map((r) => r.member.memberId));
  const leaderRowsWithoutApplication = rosterLeaders.filter(
    (m) => !memberIdsWithApplication.has(m.memberId)
  ).length;
  const rosterTableRowCount = roster.length + leaderRowsWithoutApplication;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lab console
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{lab.labName}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Publish your lab&apos;s homepage spotlight and announcements. Approved members see
            announcements on your public lab page; applications stay here for you to review.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
          <Link href={`/labs/${lab.labId}`} target="_blank" rel="noopener noreferrer">
            Public lab page
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage spotlight</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            One card for this lab on the public homepage and on your lab page. Upload a hero image
            from your device and add an optional link to your project site, demo, or repository.
          </p>
        </CardHeader>
        <CardContent>
          <LeaderProjectForm labId={lab.labId} existing={lab.spotlight} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lab announcements</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Posts appear on your public lab page for approved members, you, and executives — not on
            the main bulletin board.
          </p>
        </CardHeader>
        <CardContent>
          <LabAnnouncementForm labId={lab.labId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({rosterTableRowCount})</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Approve or decline who joins this lab. Assigned lab leaders appear here too (with a
            Leader badge); leaders without an application row are listed first. Roster changes apply
            immediately on the public lab page.
          </p>
        </CardHeader>
        <CardContent>
          <LabRosterTable rows={roster} leaders={rosterLeaders} />
        </CardContent>
      </Card>
    </div>
  );
}
