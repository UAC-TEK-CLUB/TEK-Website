import { Badge } from "@/components/ui/badge";
import type { MemberType, OfficerRole } from "@prisma/client";

export function RoleBadge({
  memberType,
  officerRole,
  level,
}: {
  memberType: MemberType;
  officerRole?: OfficerRole | null;
  level?: number | null;
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
  return <Badge>Officer · L{level ?? 1}</Badge>;
}
