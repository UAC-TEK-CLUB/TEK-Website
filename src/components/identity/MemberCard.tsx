import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/identity/RoleBadge";
import { MembershipStatusBadge } from "@/components/identity/MembershipStatusBadge";
import { fullName, initials } from "@/lib/utils";
import type { Member, ClubOfficer } from "@prisma/client";

type Props = {
  member: Member & { officerProfile?: ClubOfficer | null };
};

export function MemberCard({ member }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarFallback>{initials(member.firstName, member.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{fullName(member.firstName, member.lastName)}</p>
          <p className="text-xs text-muted-foreground">{member.universityId} · {member.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <RoleBadge
            memberType={member.memberType}
            officerRole={member.officerProfile?.officerRole}
            level={member.officerProfile?.adminAccessLevel}
          />
          <MembershipStatusBadge status={member.membershipStatus} />
        </div>
      </CardContent>
    </Card>
  );
}
