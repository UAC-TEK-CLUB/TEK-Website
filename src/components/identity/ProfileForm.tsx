"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMemberProfile } from "@/server/actions/identity";

type Props = {
  initial: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    expectedGraduation?: string;
  };
  isRegular: boolean;
};

export function ProfileForm({ initial, isRegular }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateMemberProfile({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          expectedGraduation: isRegular ? formData.get("expectedGraduation") : undefined,
        });
        setMessage("Profile updated.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Update failed.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username (sign-in)</Label>
        <Input id="username" value={initial.username} readOnly className="bg-muted font-mono" />
        <p className="text-xs text-muted-foreground">
          Used only to log in. Contact an officer if you need it changed.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={initial.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={initial.lastName} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initial.email} required />
      </div>
      {isRegular && (
        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">Expected graduation</Label>
          <Input
            id="expectedGraduation"
            name="expectedGraduation"
            type="date"
            defaultValue={initial.expectedGraduation}
            required
          />
        </div>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
