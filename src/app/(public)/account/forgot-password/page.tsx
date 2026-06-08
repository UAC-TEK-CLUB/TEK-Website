import Link from "next/link";
import { ForgotPasswordForm } from "@/components/identity/ForgotPasswordForm";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Forgot password"
      description="Confirm your website username and student ID. We'll email a 6-digit code, then you can set a new password."
      footer={
        <Button variant="ghost" className="mt-4 w-full" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
