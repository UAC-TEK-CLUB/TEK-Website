"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLabLeader } from "@/server/actions/labs";
import type { MemberType, OfficerRole } from "@prisma/client";

type Option = {
  memberId: string;
  firstName: string;
  lastName: string;
  memberType: MemberType;
  officerRole: OfficerRole | null;
};

function optionLabel(o: Option) {
  const name = `${o.firstName} ${o.lastName}`;
  if (o.memberType === "REGULAR") return `${name} (member)`;
  if (o.officerRole === "LEADER") return `${name} (lab leader)`;
  return name;
}

export function SetLabLeaderForm({
  labId,
  currentLeaderId,
  memberOptions,
}: {
  labId: string;
  currentLeaderId: string | null;
  memberOptions: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<string>(currentLeaderId ?? "__none__");

  function save() {
    setError(null);
    const leaderMemberId = value === "__none__" ? null : value;
    startTransition(async () => {
      try {
        await setLabLeader({ labId, leaderMemberId });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not update lab leader.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div>
        <Label>Lab leader</Label>
        <p className="text-xs text-muted-foreground">
          Choose any active member. Regular members are promoted to the lab leader officer role
          automatically. President and supervisor cannot be assigned here.
        </p>
      </div>
      <Select value={value} onValueChange={setValue} disabled={pending}>
        <SelectTrigger className="max-w-md">
          <SelectValue placeholder="Choose member" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No assigned leader</SelectItem>
          {memberOptions.map((o) => (
            <SelectItem key={o.memberId} value={o.memberId}>
              {optionLabel(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" size="sm" onClick={save} disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save assignment
      </Button>
    </div>
  );
}
