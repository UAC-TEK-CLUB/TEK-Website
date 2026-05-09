import type { MemberType, OfficerRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      memberId: string;
      memberType: MemberType;
      adminAccessLevel: number;
      officerRole: OfficerRole | null;
    } & DefaultSession["user"];
  }

  interface User {
    memberType?: MemberType;
    adminAccessLevel?: number;
    officerRole?: OfficerRole | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberId?: string;
    memberType?: MemberType;
    adminAccessLevel?: number;
    officerRole?: OfficerRole | null;
  }
}
