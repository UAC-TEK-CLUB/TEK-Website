import { Badge } from "@/components/ui/badge";
import type { MemberType, OfficerRole } from "@prisma/client";

const rolePillClass = "h-8 px-4 text-xs font-medium";

export function RoleBadge({
  memberType,
  officerRole,
}: {
  memberType: MemberType;
  officerRole?: OfficerRole | null;
}) {
  if (memberType !== "OFFICER") {
    return (
      <Badge variant="secondary" className={rolePillClass}>
        Member
      </Badge>
    );
  }

  if (officerRole === "PRESIDENT") {
    return (
      <Badge className={`${rolePillClass} bg-red-900 hover:bg-red-900/90 text-white`}>
        President
      </Badge>
    );
  }
  if (officerRole === "SUPERVISOR") {
    return (
      <Badge className={`${rolePillClass} bg-red-600 hover:bg-red-600/90 text-white`}>
        Supervisor
      </Badge>
    );
  }
  if (officerRole === "LEADER") {
    return (
      <Badge className={`${rolePillClass} bg-amber-700 hover:bg-amber-700/90 text-white`}>
        Lab leader
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={rolePillClass}>
      Officer
    </Badge>
  );
}
