import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLabRoster } from "@/server/actions/labs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabRosterTable } from "@/components/labs/LabRosterTable";

export default async function AdminLabDetail({
  params,
}: {
  params: { labId: string };
}) {
  const lab = await prisma.lab.findUnique({ where: { labId: params.labId } });
  if (!lab) notFound();

  const roster = await getLabRoster(params.labId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{lab.labName}</h1>
        <p className="text-sm text-muted-foreground">{lab.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <LabRosterTable rows={roster} />
        </CardContent>
      </Card>
    </div>
  );
}
