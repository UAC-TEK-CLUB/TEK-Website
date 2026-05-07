"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordAttendance } from "@/server/actions/meetings";
import { fullName } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus, Member } from "@prisma/client";

type Row = {
  member: Member;
  record?: AttendanceRecord;
};

const OPTIONS: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

export function AttendanceReport({
  meetingId,
  rows,
}: {
  meetingId: string;
  rows: Row[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ member, record }) => (
          <TableRow key={member.memberId}>
            <TableCell>
              <p className="font-medium">{fullName(member.firstName, member.lastName)}</p>
              <p className="text-xs text-muted-foreground">{member.universityId}</p>
            </TableCell>
            <TableCell className="w-[200px]">
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={record?.attendanceStatus ?? ""}
                  onValueChange={(value) =>
                    startTransition(async () => {
                      await recordAttendance({
                        meetingId,
                        memberId: member.memberId,
                        status: value,
                      });
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mark…" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
