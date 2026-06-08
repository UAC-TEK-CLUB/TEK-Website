"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/identity/SignOutButton";

export function NavbarAuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20" aria-hidden />;
  }

  if (session?.user) {
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <SignOutButton />
      </>
    );
  }

  return (
    <Button asChild size="sm">
      <Link href="/login">
        <LogIn className="mr-2 h-4 w-4" /> Sign in
      </Link>
    </Button>
  );
}
