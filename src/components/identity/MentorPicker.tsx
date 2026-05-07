"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignMentor } from "@/server/actions/identity";

type Option = { memberId: string; firstName: string; lastName: string };

export function MentorPicker({
  menteeId,
  currentMentorId,
  options,
}: {
  menteeId: string;
  currentMentorId: string | null;
  options: Option[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentMentorId ?? "__none__"}
      onValueChange={(value) =>
        startTransition(async () => {
          await assignMentor({
            menteeId,
            mentorId: value === "__none__" ? null : value,
          });
        })
      }
      disabled={pending}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select mentor" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">No mentor</SelectItem>
        {options
          .filter((o) => o.memberId !== menteeId)
          .map((o) => (
            <SelectItem key={o.memberId} value={o.memberId}>
              {o.firstName} {o.lastName}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
