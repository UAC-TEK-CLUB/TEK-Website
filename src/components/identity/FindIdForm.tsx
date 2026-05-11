"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmFindUsername, requestFindUsername } from "@/server/actions/recovery";

type Step = "id" | "code" | "done";

export function FindIdForm() {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("id");
  const [error, setError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  function sendCode(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await requestFindUsername({
          universityId: formData.get("universityId"),
        });
        setChallengeId(res.challengeId);
        setStep("code");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function verifyCode(formData: FormData) {
    setError(null);
    if (!challengeId) return;
    startTransition(async () => {
      try {
        const res = await confirmFindUsername({
          challengeId,
          code: formData.get("code"),
        });
        setUsername(res.username);
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Verification failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {step === "id" && (
        <form action={sendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="universityId">Student ID</Label>
            <Input
              id="universityId"
              name="universityId"
              required
              autoComplete="off"
              className="font-mono"
              placeholder="Same ID you used when you applied"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll email a 6-digit code to the address on your member record.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send code
          </Button>
        </form>
      )}

      {step === "code" && (
        <form action={verifyCode} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your email (expires in 15 minutes).
          </p>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              minLength={6}
              required
              autoComplete="one-time-code"
              className="font-mono text-lg tracking-widest"
              placeholder="000000"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setStep("id")}>
              Back
            </Button>
            <Button type="submit" className="sm:flex-1" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Show my username
            </Button>
          </div>
        </form>
      )}

      {step === "done" && username && (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-center text-green-950 dark:border-green-800 dark:bg-green-950/30 dark:text-green-50">
          <p className="text-sm font-medium">Your website username is:</p>
          <p className="font-mono text-xl font-bold tracking-tight">{username}</p>
          <p className="text-xs text-muted-foreground dark:text-green-100/80">
            Sign in with this username and your password — not your student ID.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
