"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setOfficerRole } from "@/server/actions/identity";
import type { OfficerRole } from "@prisma/client";

const ROLES: { value: OfficerRole; label: string }[] = [
  { value: "PRESIDENT", label: "President" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "OFFICER", label: "Officer" },
];

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

  function onChange(next: OfficerRole) {
    if (next === value) return;
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
      <Select
        value={value}
        onValueChange={(v) => onChange(v as OfficerRole)}
        disabled={disabled || pending}
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value} className="text-xs">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
