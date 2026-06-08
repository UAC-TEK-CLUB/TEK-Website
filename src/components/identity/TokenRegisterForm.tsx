"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeRegistration } from "@/server/actions/identity";
import { completeRegistrationSchema } from "@/lib/validators/identity";

type Props = {
  token: string;
  prefill: {
    firstName: string;
    lastName: string;
    email: string;
    /** Official school / campus ID from the application (shown for reference only). */
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
      const draft = {
        token,
        username: formData.get("username"),
        password,
        expectedGraduation: formData.get("expectedGraduation"),
      };
      const validated = completeRegistrationSchema.safeParse(draft);
      if (!validated.success) {
        const fe = validated.error.flatten().fieldErrors;
        setError(
          fe.username?.[0] ??
            fe.password?.[0] ??
            fe.expectedGraduation?.[0] ??
            "Check your entries and try again."
        );
        return;
      }
      try {
        const result = await completeRegistration(validated.data);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const signInRes = await signIn("credentials", {
          username: result.username,
          password,
          redirect: false,
        });
        if (signInRes?.error) {
          setError("Account created, but sign-in failed. Please use the login page.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Could not create account. Please try again.");
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
        <Label>University ID (from your application)</Label>
        <Input value={prefill.universityId} readOnly className="bg-muted font-mono" />
        <p className="text-xs text-muted-foreground">
          This is your official campus record. It is not your website login.
        </p>
      </div>
      <div className="space-y-2">
        <Label>University email</Label>
        <Input value={prefill.email} readOnly className="bg-muted" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Choose a username</Label>
        <Input
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={24}
          autoComplete="username"
          spellCheck={false}
          className="font-mono"
          placeholder="e.g. hannah_k"
        />
        <p className="text-xs text-muted-foreground">
          3–24 characters: letters, numbers, and underscores only. Stored in lowercase — this
          is what you will use to sign in.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expectedGraduation">Expected graduation/transition</Label>
        <Input id="expectedGraduation" name="expectedGraduation" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters, one capital letter (A–Z), one number, and one special character
          from: ! @ # $ % ^ & *
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account & sign in
      </Button>
    </form>
  );
}
