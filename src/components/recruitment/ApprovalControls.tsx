"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { decideApplication } from "@/server/actions/recruitment";

export function ApprovalControls({ clubAppId }: { clubAppId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function approve(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await decideApplication({
          clubAppId,
          decision: "APPROVED",
          expectedGraduation: formData.get("expectedGraduation"),
        });
        if (result?.tempPassword) setTempPassword(result.tempPassword);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Approval failed.");
      }
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      try {
        await decideApplication({ clubAppId, decision: "REJECTED" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rejection failed.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Check className="mr-1 h-4 w-4" /> Approve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve applicant</DialogTitle>
            <DialogDescription>
              This creates a Member + RegularMember row in one transaction and issues
              a temporary password.
            </DialogDescription>
          </DialogHeader>
          {tempPassword ? (
            <div className="rounded-md border bg-muted p-4 text-sm">
              <p className="font-medium">Temporary password (share securely):</p>
              <p className="mt-2 font-mono">{tempPassword}</p>
            </div>
          ) : (
            <form action={approve} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expectedGraduation">Expected graduation</Label>
                <Input
                  id="expectedGraduation"
                  name="expectedGraduation"
                  type="date"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm approval
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="outline"
        onClick={reject}
        disabled={pending}
      >
        <X className="mr-1 h-4 w-4" /> Reject
      </Button>
    </div>
  );
}
