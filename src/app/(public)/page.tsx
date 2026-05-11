import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FlaskConical, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConstellationBackdrop } from "@/components/home/ConstellationBackdrop";
import { MemberAnnouncementsSection } from "@/components/community/MemberAnnouncementsSection";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { listBulletinHighlights } from "@/server/actions/community";
import {
  listCurrentProjects,
  type CurrentProject,
} from "@/server/actions/projects";

export default async function LandingPage() {
  const session = await auth();
  const [currentProjects, bulletinHighlights] = await Promise.all([
    listCurrentProjects(6),
    session?.user?.memberId != null
      ? listBulletinHighlights(5)
      : Promise.resolve([]),
  ]);

  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/40">
        <ConstellationBackdrop className="min-h-[68vh] md:min-h-[78vh]">
          <div className="container flex flex-col items-center gap-5 py-10 text-center md:gap-6 md:py-14">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Welcome to TEK!!
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              University of Utah Asia Campus coding &amp; analytics society — one home
              for our recruitment, labs, meetings, and community.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/apply">
                  Apply to join <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/labs">Explore Labs</Link>
              </Button>
            </div>
          </div>
        </ConstellationBackdrop>
      </section>

      {bulletinHighlights.length > 0 && (
        <section className="container pb-2 pt-2 md:pb-4 md:pt-4">
          <MemberAnnouncementsSection
            posts={bulletinHighlights}
            heading="Announcements for members"
          />
        </section>
      )}

      <section className="container grid gap-3 py-6 md:grid-cols-3 md:gap-4 md:py-8">
        <Card>
          <CardHeader className="space-y-1 p-4 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="mt-2 text-base">Beginner Python videos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground sm:text-sm">
            Beginners can watch guided Python fundamentals videos and follow along
            with hands-on examples at their own pace.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 p-4 pb-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <CardTitle className="mt-2 text-base">Specialty labs</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground sm:text-sm">
            Join an existing lab or pitch a new one. Officers review every proposal.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 p-4 pb-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="mt-2 text-base">Members-only tooling</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground sm:text-sm">
            Bulletin board, gallery, peer chat, tutoring sessions and attendance
            tracking — all in one place.
          </CardContent>
        </Card>
      </section>

      <section className="container space-y-4 pb-10 pt-2 md:pb-14">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">What we&apos;re working on</h2>
            <p className="text-sm text-muted-foreground">
              Spotlight cards from each lab — managed on the lab&apos;s page by its leader.
            </p>
          </div>
        </div>

        {currentProjects.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No lab spotlights yet. Check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentProjects.map((project: CurrentProject) => {
              const leader = project.lab.leader;
              return (
                <Card key={project.projectId} className="overflow-hidden">
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={project.photoUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader className="space-y-2 p-4 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {project.lab.labName}
                      </Badge>
                      {leader?.officerProfile?.officerRole && (
                        <Badge variant="secondary">
                          {roleLabel(leader.officerProfile.officerRole)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {leader
                        ? `${leader.firstName} ${leader.lastName} · `
                        : "Lab spotlight · "}
                      Updated {formatDate(project.updatedAt)}
                    </p>
                    <Button asChild variant="link" className="h-auto p-0 text-xs">
                      <Link href={`/labs/${project.lab.labId}`}>View lab page</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                    {project.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function roleLabel(role: "PRESIDENT" | "SUPERVISOR" | "LEADER") {
  switch (role) {
    case "PRESIDENT":
      return "President";
    case "SUPERVISOR":
      return "Supervisor";
    case "LEADER":
      return "Lab leader";
    default:
      return role;
  }
}
