import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleBadge } from "@/components/identity/RoleBadge";
import { MembershipStatusBadge } from "@/components/identity/MembershipStatusBadge";
import { MentorPicker } from "@/components/identity/MentorPicker";
import { fullName } from "@/lib/utils";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    include: { officerProfile: true, mentor: true },
    orderBy: [{ memberType: "desc" }, { lastName: "asc" }],
  });

  const mentorOptions = members.map((m) => ({
    memberId: m.memberId,
    firstName: m.firstName,
    lastName: m.lastName,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Officers, regular members, mentors, and statuses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active roster ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>University ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mentor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.memberId}>
                  <TableCell>
                    <p className="font-medium">{fullName(m.firstName, m.lastName)}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.universityId}</TableCell>
                  <TableCell>
                    <RoleBadge
                      memberType={m.memberType}
                      level={m.officerProfile?.adminAccessLevel}
                    />
                  </TableCell>
                  <TableCell>
                    <MembershipStatusBadge status={m.membershipStatus} />
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <MentorPicker
                      menteeId={m.memberId}
                      currentMentorId={m.mentorId}
                      options={mentorOptions}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
