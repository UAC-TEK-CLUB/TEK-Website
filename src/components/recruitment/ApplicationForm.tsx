"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/server/actions/recruitment";

export function ApplicationForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await submitApplication({
          universityId: formData.get("universityId"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          major: formData.get("major"),
          codingExperience: formData.get("codingExperience"),
        });
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submission failed.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8" />
        <p className="font-semibold">Application received.</p>
        <p className="mt-1 text-sm">
          We&apos;ll review your application and email you within a week.
        </p>
      </div>
    );
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
        <Label htmlFor="major">Major</Label>
        <Input id="major" name="major" placeholder="e.g. Computer Science" required />
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
