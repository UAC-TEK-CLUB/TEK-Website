import Link from "next/link";
import { LoginForm } from "@/components/identity/LoginForm";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-14 w-auto max-h-14" />
          </div>
          <CardTitle className="text-2xl">Sign in to UAC TEK Club</CardTitle>
          <CardDescription>Use the username and password you chose when you activated your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm errorParam={searchParams.error} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/account/find-id" className="font-medium text-primary hover:underline">
              Forgot username
            </Link>
            {" · "}
            <Link href="/account/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Want to join?{" "}
            <Link href="/apply" className="font-medium text-primary hover:underline">
              Apply here
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
