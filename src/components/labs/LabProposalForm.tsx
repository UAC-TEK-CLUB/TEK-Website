"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLabProposal } from "@/server/actions/labs";

export function LabProposalForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await submitLabProposal({
          proposedName: formData.get("proposedName"),
          description: formData.get("description"),
          objective: formData.get("objective"),
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
        <p className="font-semibold">Proposal submitted.</p>
        <p className="mt-1 text-sm">Officers will review and you&apos;ll see the decision in your dashboard.</p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="proposedName">Proposed lab name</Label>
        <Input id="proposedName" name="proposedName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="objective">Objective</Label>
        <Textarea id="objective" name="objective" rows={3} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit proposal
      </Button>
    </form>
  );
}
