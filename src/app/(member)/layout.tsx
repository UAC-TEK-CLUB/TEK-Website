import { Navbar } from "@/components/layout/Navbar";
import { MemberSidebar } from "@/components/layout/MemberSidebar";
import { isSiteAdmin, requireMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMember();
  const ledLabs = await prisma.lab.findMany({
    where: { leaderMemberId: user.memberId },
    select: { labId: true, labName: true },
    orderBy: { labName: "asc" },
  });
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 px-0 py-0 md:px-6">
        <MemberSidebar isSiteAdmin={isSiteAdmin(user)} ledLabs={ledLabs} />
        <main className="flex-1 px-4 py-6 md:px-0">{children}</main>
      </div>
    </div>
  );
}
