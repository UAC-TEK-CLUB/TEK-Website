import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/permissions";
import { canManageLabApplications } from "@/lib/labAccess";
import { getLabRoster } from "@/server/actions/labs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabRosterTable } from "@/components/labs/LabRosterTable";
import { LabAnnouncementForm } from "@/components/community/LabAnnouncementForm";
import { LeaderProjectForm } from "@/components/projects/LeaderProjectForm";

export default async function LabManagePage({
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
        select: { projectId: true, title: true, description: true, photoUrl: true },
      },
    },
  });
  if (!lab) notFound();

  const roster = await getLabRoster(params.labId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage {lab.labName}</h1>
        <p className="text-sm text-muted-foreground">
          Review applications, post announcements, and publish this lab&apos;s homepage spotlight.
          Lab-only posts appear on your public lab page for approved members; club-wide posts stay on
          the main bulletin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage spotlight</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            One card for this lab on the public homepage and on this lab page. Paste a public image
            URL for now.
          </p>
        </CardHeader>
        <CardContent>
          <LeaderProjectForm labId={lab.labId} existing={lab.spotlight} />
        </CardContent>
      </Card>

      <LabAnnouncementForm labId={lab.labId} />

      <Card>
        <CardHeader>
          <CardTitle>Applications ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <LabRosterTable rows={roster} />
        </CardContent>
      </Card>
    </div>
  );
}
