import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApplicantTable } from "@/components/recruitment/ApplicantTable";
import { VisitorAnalyticsCard } from "@/components/recruitment/VisitorAnalyticsCard";
import { listApplications, visitorAnalytics } from "@/server/actions/recruitment";
import { prisma } from "@/lib/prisma";

export default async function AdminApplicantsPage() {
  const [pending, approved, rejected, analytics] = await Promise.all([
    listApplications({ status: "PENDING" }),
    listApplications({ status: "APPROVED" }),
    listApplications({ status: "REJECTED" }),
    visitorAnalytics(),
  ]);

  const allApps = [...pending, ...approved, ...rejected];
  const universityIds = [...new Set(allApps.map((r) => r.applicant.universityId))];
  const existingMembers =
    universityIds.length === 0
      ? []
      : await prisma.member.findMany({
          where: { universityId: { in: universityIds } },
          select: { universityId: true },
        });
  const registeredUniversityIds = existingMembers.map((m) => m.universityId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-sm text-muted-foreground">
          Review applications and convert approvals into Members.
        </p>
      </div>

      <VisitorAnalyticsCard {...analytics} />

      <Card>
        <CardHeader>
          <CardTitle>Application queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <ApplicantTable rows={pending} registeredUniversityIds={registeredUniversityIds} />
            </TabsContent>
            <TabsContent value="approved">
              <ApplicantTable rows={approved} registeredUniversityIds={registeredUniversityIds} />
            </TabsContent>
            <TabsContent value="rejected">
              <ApplicantTable rows={rejected} registeredUniversityIds={registeredUniversityIds} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
