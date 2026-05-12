"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeMyPassword } from "@/server/actions/identity";

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await changeMyPassword({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
          confirmPassword: formData.get("confirmPassword"),
        });
        form.reset();
        setSuccess("Password updated.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update password.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters, one capital letter (A–Z), one number, and one special character
          from: ! @ # $ % ^ & *
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-primary">{success}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}
