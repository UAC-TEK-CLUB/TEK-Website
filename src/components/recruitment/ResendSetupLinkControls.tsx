"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resendAccountSetupLink } from "@/server/actions/recruitment";

export function ResendSetupLinkControls({ clubAppId }: { clubAppId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [registerUrl, setRegisterUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resend() {
    setError(null);
    setRegisterUrl(null);
    startTransition(async () => {
      try {
        const result = await resendAccountSetupLink({ clubAppId });
        if (result?.registerUrl) {
          const fullUrl = `${window.location.origin}${result.registerUrl}`;
          setRegisterUrl(fullUrl);
          setOpen(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not resend link.");
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
      <Button size="sm" variant="secondary" disabled={pending} onClick={resend}>
        {pending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-1 h-4 w-4" />
        )}
        Resend setup link
      </Button>
      {error && <p className="w-full text-right text-sm text-destructive">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New setup link</DialogTitle>
            <DialogDescription>
              We emailed a fresh one-time link and rotated the old token. Share the URL below
              manually if needed.
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
                The link becomes invalid as soon as the applicant finishes registration.
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
