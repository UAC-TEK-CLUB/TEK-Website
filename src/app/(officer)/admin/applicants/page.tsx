import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApplicantTable } from "@/components/recruitment/ApplicantTable";
import { VisitorAnalyticsCard } from "@/components/recruitment/VisitorAnalyticsCard";
import { listApplications, visitorAnalytics } from "@/server/actions/recruitment";

export default async function AdminApplicantsPage() {
  const [pending, approved, rejected, analytics] = await Promise.all([
    listApplications({ status: "PENDING" }),
    listApplications({ status: "APPROVED" }),
    listApplications({ status: "REJECTED" }),
    visitorAnalytics(),
  ]);

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
              <ApplicantTable rows={pending} />
            </TabsContent>
            <TabsContent value="approved">
              <ApplicantTable rows={approved} />
            </TabsContent>
            <TabsContent value="rejected">
              <ApplicantTable rows={rejected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
