"use client";

import { useEffect, useState, useTransition } from "react";
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
import { setLabLeaders } from "@/server/actions/labs";
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
  if (o.officerRole === "PRESIDENT") return `${name} (president)`;
  if (o.officerRole === "LEADER") return `${name} (lab leader)`;
  return name;
}

export function SetLabLeaderForm({
  labId,
  currentLeaderMemberIds,
  memberOptions,
}: {
  labId: string;
  /** Up to two member IDs in display order (primary / secondary). */
  currentLeaderMemberIds: string[];
  memberOptions: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [leader1, setLeader1] = useState<string>(currentLeaderMemberIds[0] ?? "__none__");
  const [leader2, setLeader2] = useState<string>(currentLeaderMemberIds[1] ?? "__none__");

  useEffect(() => {
    setLeader1(currentLeaderMemberIds[0] ?? "__none__");
    setLeader2(currentLeaderMemberIds[1] ?? "__none__");
  }, [currentLeaderMemberIds.join("|")]);

  useEffect(() => {
    if (leader2 !== "__none__" && leader2 === leader1) {
      setLeader2("__none__");
    }
  }, [leader1, leader2]);

  function save() {
    setError(null);
    const ids: string[] = [];
    if (leader1 !== "__none__") ids.push(leader1);
    if (leader2 !== "__none__" && leader2 !== leader1) ids.push(leader2);
    startTransition(async () => {
      try {
        await setLabLeaders({ labId, leaderMemberIds: ids });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not update lab leaders.");
      }
    });
  }

  const optionsForSecond = memberOptions.filter((o) => o.memberId !== leader1);

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div>
        <Label>Lab leaders (up to 2)</Label>
        <p className="text-xs text-muted-foreground">
          Choose active members. Regular members are promoted to the lab leader officer role
          automatically. Presidents are allowed; supervisors are not. Pick none on both to clear
          all leaders.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Primary</Label>
          <Select value={leader1} onValueChange={setLeader1} disabled={pending}>
            <SelectTrigger>
              <SelectValue placeholder="Choose member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {memberOptions.map((o) => (
                <SelectItem key={o.memberId} value={o.memberId}>
                  {optionLabel(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Secondary (optional)</Label>
          <Select value={leader2} onValueChange={setLeader2} disabled={pending}>
            <SelectTrigger>
              <SelectValue placeholder="Choose member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {optionsForSecond.map((o) => (
                <SelectItem key={o.memberId} value={o.memberId}>
                  {optionLabel(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" size="sm" onClick={save} disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save leaders
      </Button>
    </div>
  );
}
