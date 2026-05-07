import Link from "next/link";
import { Code2 } from "lucide-react";
import { RegisterForm } from "@/components/identity/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <Code2 className="mx-auto h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Create your TEK account</CardTitle>
          <CardDescription>
            For approved members. New applicants should{" "}
            <Link href="/apply" className="text-primary hover:underline">
              apply here
            </Link>{" "}
            first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
