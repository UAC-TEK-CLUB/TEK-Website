import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { MemberType, OfficerRole } from "@prisma/client";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Member credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const normalized = parsed.data.username.trim().toLowerCase();
        const member = await prisma.member.findUnique({
          where: { username: normalized },
          include: { officerProfile: true },
        });
        if (!member?.passwordHash) return null;
        if (member.membershipStatus === "SUSPENDED") return null;

        const ok = await bcrypt.compare(parsed.data.password, member.passwordHash);
        if (!ok) return null;

        return {
          id: member.memberId,
          email: member.email,
          name: `${member.firstName} ${member.lastName}`,
          memberType: member.memberType,
          adminAccessLevel: member.officerProfile?.adminAccessLevel ?? 0,
          officerRole: member.officerProfile?.officerRole ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.memberId = user.id;
        token.memberType = (user as { memberType?: MemberType }).memberType;
        token.adminAccessLevel = (user as { adminAccessLevel?: number }).adminAccessLevel ?? 0;
        token.officerRole = (user as { officerRole?: OfficerRole | null }).officerRole ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.memberId = token.memberId as string;
        session.user.memberType = token.memberType as MemberType;
        session.user.adminAccessLevel = (token.adminAccessLevel as number) ?? 0;
        session.user.officerRole = (token.officerRole as OfficerRole | null) ?? null;
      }
      return session;
    },
  },
});
