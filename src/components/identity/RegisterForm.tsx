"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerMember } from "@/server/actions/identity";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const universityId = formData.get("universityId") as string;
      const password = formData.get("password") as string;
      try {
        await registerMember({
          universityId,
          email: formData.get("email"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          password,
          expectedGraduation: formData.get("expectedGraduation"),
        });
        await signIn("credentials", {
          universityId,
          password,
          redirect: false,
        });
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not create account.";
        setError(msg);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="universityId">University ID</Label>
        <Input id="universityId" name="universityId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">University email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expectedGraduation">Expected graduation</Label>
        <Input id="expectedGraduation" name="expectedGraduation" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
