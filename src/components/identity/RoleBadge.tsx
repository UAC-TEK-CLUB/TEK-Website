import { Badge } from "@/components/ui/badge";
import type { MemberType, OfficerRole } from "@prisma/client";

export function RoleBadge({
  memberType,
  officerRole,
}: {
  memberType: MemberType;
  officerRole?: OfficerRole | null;
}) {
  if (memberType !== "OFFICER") {
    return <Badge variant="secondary">Member</Badge>;
  }

  if (officerRole === "PRESIDENT") {
    return <Badge className="bg-red-900 hover:bg-red-900/90 text-white">President</Badge>;
  }
  if (officerRole === "SUPERVISOR") {
    return <Badge className="bg-red-600 hover:bg-red-600/90 text-white">Supervisor</Badge>;
  }
  if (officerRole === "LEADER") {
    return <Badge className="bg-amber-700 hover:bg-amber-700/90 text-white">Lab leader</Badge>;
  }
  return <Badge variant="secondary">Officer</Badge>;
}
