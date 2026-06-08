import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TokenRegisterForm } from "@/components/identity/TokenRegisterForm";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <InvalidTokenView reason="missing" />;
  }

  const application = await prisma.clubApplication.findUnique({
    where: { accountSetupToken: token },
    include: { applicant: true },
  });

  if (!application || application.status !== "APPROVED") {
    return <InvalidTokenView reason="invalid" />;
  }

  return (
    <AuthPageShell
      cardClassName="w-full max-w-lg"
      title="Welcome to UAC TEK Club"
      description="Your application is approved. Pick a username and password for this site (your username is not your university ID)."
    >
      <TokenRegisterForm
        token={token}
        prefill={{
          firstName: application.applicant.firstName,
          lastName: application.applicant.lastName,
          email: application.applicant.email,
          universityId: application.applicant.universityId,
        }}
      />
    </AuthPageShell>
  );
}

function InvalidTokenView({ reason }: { reason: "missing" | "invalid" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <CardTitle className="text-xl">
            {reason === "missing" ? "Invitation required" : "Setup link no longer valid"}
          </CardTitle>
          <CardDescription>
            {reason === "missing"
              ? "Accounts are created from accepted applications."
              : "This link may have expired or already been used."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/apply">Apply to join</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">I already have an account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
