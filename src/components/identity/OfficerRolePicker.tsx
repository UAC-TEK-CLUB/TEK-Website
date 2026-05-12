"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setOfficerRole } from "@/server/actions/identity";
import { cn } from "@/lib/utils";
import type { OfficerRole } from "@prisma/client";

function roleTriggerClass(role: OfficerRole) {
  if (role === "PRESIDENT") {
    return "border-red-900/50 bg-red-900 text-white hover:bg-red-900/90";
  }
  return "border-amber-700/40 bg-amber-700 text-white hover:bg-amber-700/90";
}

function roleLabel(role: OfficerRole) {
  return role === "PRESIDENT" ? "President" : "Lab leader";
}

function nextRole(current: OfficerRole): OfficerRole {
  return current === "PRESIDENT" ? "LEADER" : "PRESIDENT";
}

export function OfficerRolePicker({
  memberId,
  current,
  disabled,
}: {
  memberId: string;
  current: OfficerRole;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<OfficerRole>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onToggle() {
    const next = nextRole(value);
    setError(null);
    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        await setOfficerRole({ memberId, officerRole: next });
      } catch (err) {
        setValue(previous);
        setError(err instanceof Error ? err.message : "Could not change role.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={onToggle}
        disabled={disabled || pending}
        className={cn(
          "h-8 rounded-full border px-4 text-xs font-medium transition-colors",
          roleTriggerClass(value)
        )}
        title={`Switch to ${roleLabel(nextRole(value))}`}
      >
        {roleLabel(value)}
      </Button>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
