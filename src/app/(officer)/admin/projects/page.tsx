import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requirePresident } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminProjectsPage() {
  await requirePresident();

  const labs = await prisma.lab.findMany({
    orderBy: { labName: "asc" },
    include: {
      spotlight: true,
      leaderAssignments: {
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              officerProfile: { select: { officerRole: true } },
            },
          },
        },
      },
    },
  });

  const withSpotlight = labs.filter((l) => l.spotlight).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lab spotlights</h1>
        <p className="text-sm text-muted-foreground">
          Each lab has at most one spotlight, edited from that lab&apos;s console.{" "}
          {withSpotlight} of {labs.length} labs currently publish a card on the homepage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All labs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {labs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No labs yet.</p>
          ) : (
            labs.map((lab) => (
              <div
                key={lab.labId}
                className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-start"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md border bg-muted md:w-40">
                  {lab.spotlight ? (
                    <Image
                      src={lab.spotlight.photoUrl}
                      alt={lab.spotlight.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={lab.spotlight.photoUrl.startsWith("/")}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                      No spotlight
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{lab.labName}</p>
                    {lab.spotlight && (
                      <Badge variant="secondary">Homepage</Badge>
                    )}
                  </div>
                  {lab.leaderAssignments.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {lab.leaderAssignments.length === 1 ? "Leader" : "Leaders"}:{" "}
                      {lab.leaderAssignments
                        .map((a) => {
                          const m = a.member;
                          const suffix =
                            m.officerProfile?.officerRole === "LEADER" ? " (lab leader role)" : "";
                          return `${m.firstName} ${m.lastName}${suffix}`;
                        })
                        .join(" · ")}
                    </p>
                  )}
                  {lab.spotlight ? (
                    <>
                      <p className="text-sm font-medium">{lab.spotlight.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(lab.spotlight.updatedAt)}
                      </p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {lab.spotlight.description}
                      </p>
                      {lab.spotlight.websiteUrl && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Link:</span>{" "}
                          <a
                            href={lab.spotlight.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-primary underline-offset-4 hover:underline"
                          >
                            {lab.spotlight.websiteUrl}
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No spotlight published for this lab yet.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/labs/${lab.labId}/console`}>Lab console</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/labs/${lab.labId}`}>Public lab page</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
