import Link from "next/link";
import { Code2 } from "lucide-react";
import { LoginForm } from "@/components/identity/LoginForm";
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
          <Code2 className="mx-auto h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Sign in to TEK Club</CardTitle>
          <CardDescription>Use your university ID and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm errorParam={searchParams.error} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
