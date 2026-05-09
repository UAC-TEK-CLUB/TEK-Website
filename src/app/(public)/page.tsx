import Link from "next/link";
import { ArrowRight, FlaskConical, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConstellationBackdrop } from "@/components/home/ConstellationBackdrop";

export default function LandingPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/40">
        <ConstellationBackdrop className="min-h-[68vh] md:min-h-[78vh]">
          <div className="container flex flex-col items-center gap-5 py-10 text-center md:gap-6 md:py-14">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              UAC TEK Club
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

      <section className="container grid gap-3 py-6 md:grid-cols-3 md:gap-4 md:py-8">
        <Card>
          <CardHeader className="space-y-1 p-4 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="mt-2 text-base">Mentorship pipeline</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground sm:text-sm">
            Every new member is paired with a senior mentor through our recursive
            mentorship graph.
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
    </>
  );
}
