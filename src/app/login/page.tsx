import Link from "next/link";
import { LoginForm } from "@/components/identity/LoginForm";
import { AuthPageShell } from "@/components/layout/AuthPageShell";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AuthPageShell
      title="Sign in to UAC TEK Club"
      description="Use the username and password you chose when you activated your account."
      footer={
        <>
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
          </p>
        </>
      }
    >
      <LoginForm errorParam={searchParams.error} />
    </AuthPageShell>
  );
}
