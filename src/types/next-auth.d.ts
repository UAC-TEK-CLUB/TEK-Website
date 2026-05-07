import type { MemberType } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      memberId: string;
      memberType: MemberType;
      adminAccessLevel: number;
    } & DefaultSession["user"];
  }

  interface User {
    memberType?: MemberType;
    adminAccessLevel?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberId?: string;
    memberType?: MemberType;
    adminAccessLevel?: number;
  }
}
