"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/server/actions/recruitment";
import { AUTO_ELIGIBLE_MAJORS_DISPLAY } from "@/lib/policy/autoAccept";

export function ApplicationForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitApplication({
          universityId: formData.get("universityId"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          major: formData.get("major"),
          codingExperience: formData.get("codingExperience"),
        });

        if (result.accepted) {
          router.push(result.registerUrl);
          return;
        }
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submission failed.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-50">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" />
        <p className="font-semibold">Application received.</p>
        <p className="mt-1 text-sm">
          We just sent a confirmation to your email. An officer will review your
          application within a week and email you a link to set up your account if
          approved.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p>
          Applicants majoring in{" "}
          <span className="font-medium text-foreground">
            {AUTO_ELIGIBLE_MAJORS_DISPLAY.join(", ")}
          </span>{" "}
          are auto-accepted and can set up their account right away. All other
          majors are reviewed by an officer.
        </p>
      </div>

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
        <Label htmlFor="major">Major</Label>
        <Input id="major" name="major" placeholder="e.g. Information Systems" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="codingExperience">Coding experience</Label>
        <Textarea
          id="codingExperience"
          name="codingExperience"
          required
          rows={5}
          placeholder="Tell us briefly about your background — languages, projects, what you want to learn."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit application
      </Button>
    </form>
  );
}
