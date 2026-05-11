import { prisma } from "@/lib/prisma";
import { isSiteAdmin, requireSiteAdmin } from "@/lib/permissions";
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
import { OfficerRolePicker } from "@/components/identity/OfficerRolePicker";
import { fullName } from "@/lib/utils";
export default async function AdminMembersPage() {
  const me = await requireSiteAdmin();
  const canEditRoles = isSiteAdmin(me);

  const members = await prisma.member.findMany({
    include: { officerProfile: true },
    orderBy: [{ memberType: "desc" }, { lastName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Each person has one role: member, lab leader, supervisor, or president. Supervisors and
          presidents share full site administration. Lab leaders manage their lab roster and lab
          announcements from the member sidebar.
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
                <TableHead>Username</TableHead>
                <TableHead>University ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.memberId}>
                  <TableCell>
                    <p className="font-medium">{fullName(m.firstName, m.lastName)}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.username}</TableCell>
                  <TableCell className="font-mono text-xs">{m.universityId}</TableCell>
                  <TableCell>
                    {m.officerProfile && canEditRoles ? (
                      <OfficerRolePicker
                        memberId={m.memberId}
                        current={m.officerProfile.officerRole}
                      />
                    ) : (
                      <RoleBadge
                        memberType={m.memberType}
                        officerRole={m.officerProfile?.officerRole}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <MembershipStatusBadge status={m.membershipStatus} />
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
