import { prisma } from "@/lib/prisma";
import { requirePresident } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalQueue } from "@/components/labs/ProposalQueue";

export default async function AdminProposalsPage() {
  await requirePresident();
  const [pending, approved, rejected] = await Promise.all([
    prisma.labProposal.findMany({
      where: { status: "PENDING" },
      include: { proposedBy: true },
      orderBy: { proposedAt: "desc" },
    }),
    prisma.labProposal.findMany({
      where: { status: "APPROVED" },
      include: { proposedBy: true },
      orderBy: { proposedAt: "desc" },
    }),
    prisma.labProposal.findMany({
      where: { status: "REJECTED" },
      include: { proposedBy: true },
      orderBy: { proposedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lab proposals</h1>
        <p className="text-sm text-muted-foreground">
          Approving a proposal automatically creates the lab.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <ProposalQueue rows={pending} />
            </TabsContent>
            <TabsContent value="approved">
              <ProposalQueue rows={approved} />
            </TabsContent>
            <TabsContent value="rejected">
              <ProposalQueue rows={rejected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
