"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { MembershipStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MembershipStatusBadge } from "@/components/identity/MembershipStatusBadge";
import { setMembershipStatus } from "@/server/actions/identity";

const STATUS_OPTIONS: { value: MembershipStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function MembershipStatusPicker({
  memberId,
  current,
  disabled,
}: {
  memberId: string;
  current: MembershipStatus;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<MembershipStatus>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: MembershipStatus) {
    if (next === value) return;
    setError(null);
    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        await setMembershipStatus({ memberId, status: next });
      } catch (err) {
        setValue(previous);
        setError(err instanceof Error ? err.message : "Could not update status.");
      }
    });
  }

  if (disabled) {
    return <MembershipStatusBadge status={current} />;
  }

  return (
    <div className="flex min-w-[8.5rem] flex-col gap-1">
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange} disabled={pending}>
          <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label="Membership status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
