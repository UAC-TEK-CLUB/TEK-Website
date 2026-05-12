"use client";

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ApproveDecisionButton,
  RejectDecisionButton,
} from "@/components/common/ReviewDecisionButtons";
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
  const [registerUrl, setRegisterUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    setRegisterUrl(null);
    startTransition(async () => {
      try {
        const result = await decideApplication({ clubAppId, decision: "APPROVED" });
        if (result?.registerUrl) {
          const fullUrl = `${window.location.origin}${result.registerUrl}`;
          setRegisterUrl(fullUrl);
          setOpen(true);
        }
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

  async function copyToClipboard() {
    if (!registerUrl) return;
    await navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <RejectDecisionButton disabled={pending} onClick={reject} />
      <ApproveDecisionButton disabled={pending} onClick={approve} />

      {error && <p className="ml-2 text-sm text-destructive">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Applicant approved</DialogTitle>
            <DialogDescription>
              We just emailed the applicant a one-time setup link. You can also
              copy it below and share it manually if needed.
            </DialogDescription>
          </DialogHeader>
          {registerUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-xs">
                  {registerUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The link becomes invalid as soon as the applicant uses it.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
