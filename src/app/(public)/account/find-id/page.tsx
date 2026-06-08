import Link from "next/link";
import { FindIdForm } from "@/components/identity/FindIdForm";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { Button } from "@/components/ui/button";

export default function FindIdPage() {
  return (
    <AuthPageShell
      title="Find your username"
      description="Enter your student ID. We'll email a 6-digit code to the address on your TEK Club account."
      footer={
        <Button variant="ghost" className="mt-4 w-full" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      }
    >
      <FindIdForm />
    </AuthPageShell>
  );
}
