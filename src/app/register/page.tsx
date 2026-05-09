import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { prisma } from "@/lib/prisma";
import { TokenRegisterForm } from "@/components/identity/TokenRegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-14 w-auto max-h-14" />
          </div>
          <CardTitle className="text-2xl">Welcome to UAC TEK Club</CardTitle>
          <CardDescription>
            Your application is approved. Set a password to finish creating your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenRegisterForm
            token={token}
            prefill={{
              firstName: application.applicant.firstName,
              lastName: application.applicant.lastName,
              email: application.applicant.email,
              universityId: application.applicant.universityId,
            }}
          />
        </CardContent>
      </Card>
    </div>
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
