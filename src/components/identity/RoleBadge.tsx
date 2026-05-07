import { Badge } from "@/components/ui/badge";
import type { MemberType } from "@prisma/client";

export function RoleBadge({
  memberType,
  level,
}: {
  memberType: MemberType;
  level?: number | null;
}) {
  if (memberType === "OFFICER") {
    return <Badge>Officer · L{level ?? 1}</Badge>;
  }
  return <Badge variant="secondary">Member</Badge>;
}
