"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completePasswordChangeTicket } from "@/server/actions/recovery";
import { registrationPasswordSchema } from "@/lib/validators/identity";

type Props = { token: string };

export function SetNewPasswordForm({ token }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const pwOnly = registrationPasswordSchema.safeParse(password);
    if (!pwOnly.success) {
      setError(pwOnly.error.issues[0]?.message ?? "Invalid password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const { username } = await completePasswordChangeTicket({
          token,
          password,
          confirmPassword,
        });
        const signInRes = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });
        if (signInRes?.error) {
          setError("Password updated. Please sign in from the login page with your new password.");
          router.push("/login");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not update password.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your password was temporarily set to your username. Choose a new password below (same rules
        as registration).
      </p>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        At least 8 characters, one capital letter, one number, and one of: ! @ # $ % ^ & *
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save and sign in
      </Button>
    </form>
  );
}
