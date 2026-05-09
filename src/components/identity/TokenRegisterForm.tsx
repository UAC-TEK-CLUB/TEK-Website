"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeRegistration } from "@/server/actions/identity";

type Props = {
  token: string;
  prefill: {
    firstName: string;
    lastName: string;
    email: string;
    universityId: string;
  };
};

export function TokenRegisterForm({ token, prefill }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const password = formData.get("password") as string;
      try {
        const result = await completeRegistration({
          token,
          password,
          expectedGraduation: formData.get("expectedGraduation"),
        });
        const signInRes = await signIn("credentials", {
          universityId: result.universityId,
          password,
          redirect: false,
        });
        if (signInRes?.error) {
          setError("Account created, but sign-in failed. Please use the login page.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create account.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input value={prefill.firstName} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input value={prefill.lastName} readOnly className="bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>University ID</Label>
        <Input value={prefill.universityId} readOnly className="bg-muted font-mono" />
      </div>
      <div className="space-y-2">
        <Label>University email</Label>
        <Input value={prefill.email} readOnly className="bg-muted" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expectedGraduation">Expected graduation</Label>
        <Input id="expectedGraduation" name="expectedGraduation" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Choose a password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account & sign in
      </Button>
    </form>
  );
}
