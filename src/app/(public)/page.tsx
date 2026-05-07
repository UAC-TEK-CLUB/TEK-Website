import Link from "next/link";
import { ArrowRight, Code2, FlaskConical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/40">
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <Code2 className="h-12 w-12 text-primary" />
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            The TEK Club Management Portal
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            One home for our recruitment, labs, meetings, and community. Built for our
            members, by our members.
          </p>
          <div className="flex gap-3">
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
      </section>

      <section className="container grid gap-6 py-16 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="mt-3">Mentorship pipeline</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Every new member is paired with a senior mentor through our recursive
            mentorship graph.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FlaskConical className="h-6 w-6 text-primary" />
            <CardTitle className="mt-3">Specialty labs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Join an existing lab or pitch a new one. Officers review every proposal.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Code2 className="h-6 w-6 text-primary" />
            <CardTitle className="mt-3">Members-only tooling</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Bulletin board, gallery, peer chat, tutoring sessions and attendance
            tracking — all in one place.
          </CardContent>
        </Card>
      </section>
    </>
  );
}
