import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { FindIdForm } from "@/components/identity/FindIdForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FindIdPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-14 w-auto max-h-14" />
          </div>
          <CardTitle className="text-2xl">Find your username</CardTitle>
          <CardDescription>
            Enter your student ID. We&apos;ll email a 6-digit code to the address on your TEK Club
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FindIdForm />
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
