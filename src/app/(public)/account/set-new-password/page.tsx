import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SetNewPasswordForm } from "@/components/identity/SetNewPasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-14 w-auto max-h-14" />
          </div>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>
            This page is valid for a short time after you verify your email code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetNewPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
