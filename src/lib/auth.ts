import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { MemberType } from "@prisma/client";

const credentialsSchema = z.object({
  universityId: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "University Credentials",
      credentials: {
        universityId: { label: "University ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const member = await prisma.member.findUnique({
          where: { universityId: parsed.data.universityId },
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.memberId = token.memberId as string;
        session.user.memberType = token.memberType as MemberType;
        session.user.adminAccessLevel = (token.adminAccessLevel as number) ?? 0;
      }
      return session;
    },
  },
});
