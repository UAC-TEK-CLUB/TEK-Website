import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { SetNewPasswordForm } from "@/components/identity/SetNewPasswordForm";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetNewPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <CardTitle className="text-xl">Invalid link</CardTitle>
            <CardDescription>
              Open the link from your password reset flow, or start over from Forgot password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/account/forgot-password">Forgot password</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthPageShell
      title="Set a new password"
      description="This page is valid for a short time after you verify your email code."
    >
      <SetNewPasswordForm token={token} />
    </AuthPageShell>
  );
}
