import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabApplicationButton } from "@/components/labs/LabApplicationButton";

export default async function LabDetailPage({
  params,
}: {
  params: { labId: string };
}) {
  const lab = await prisma.lab.findUnique({
    where: { labId: params.labId },
    include: { _count: { select: { applications: true } } },
  });
  if (!lab) notFound();

  const session = await auth();
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

  return (
    <div className="container max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{lab.labName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{lab.description}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Objective:</span> {lab.objective}
          </p>
          <p className="text-sm text-muted-foreground">
            {lab._count.applications} applications received
          </p>
          {myApplicationStatus && (
            <div className="flex items-center gap-2 text-sm">
              <span>Your status:</span>
              <Badge>{myApplicationStatus}</Badge>
            </div>
          )}
          {session?.user ? (
            <LabApplicationButton labId={lab.labId} currentStatus={myApplicationStatus} />
          ) : (
            <Button asChild>
              <Link href="/login">Sign in to apply</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
