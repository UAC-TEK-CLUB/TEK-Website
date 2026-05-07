import { Badge } from "@/components/ui/badge";
import type { MembershipStatus } from "@prisma/client";

const STATUS_VARIANT: Record<
  MembershipStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  ALUMNI: "outline",
  SUSPENDED: "destructive",
};

export function MembershipStatusBadge({ status }: { status: MembershipStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
