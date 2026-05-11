"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmPasswordReset, requestPasswordReset } from "@/server/actions/recovery";

type Step = "identify" | "code";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("identify");
  const [error, setError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  function sendCode(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await requestPasswordReset({
          username: formData.get("username"),
          universityId: formData.get("universityId"),
        });
        setChallengeId(res.challengeId);
        setStep("code");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function verifyAndContinue(formData: FormData) {
    setError(null);
    if (!challengeId) return;
    startTransition(async () => {
      try {
        const res = await confirmPasswordReset({
          challengeId,
          code: formData.get("code"),
        });
        router.push(res.setPasswordPath);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Verification failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {step === "identify" && (
        <form action={sendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Website username</Label>
            <Input
              id="username"
              name="username"
              required
              autoComplete="username"
              spellCheck={false}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="universityId">Student ID</Label>
            <Input
              id="universityId"
              name="universityId"
              required
              autoComplete="off"
              className="font-mono"
              placeholder="Must match the ID on your account"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll email a 6-digit code to your address on file. After you confirm the code,
              your password will be set to your username until you choose a new one.
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
        <form action={verifyAndContinue} className="space-y-4">
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
            <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setStep("identify")}>
              Back
            </Button>
            <Button type="submit" className="sm:flex-1" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
