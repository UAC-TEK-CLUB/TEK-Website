import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL to Neon connection string");

  const prisma = new PrismaClient({
    adapter: new PrismaNeonHttp(url, {}),
  });

  const member = await prisma.member.findUnique({
    where: { username: "kojh0518" },
    include: { officerProfile: true },
  });
  console.log("member", member?.memberId, member?.officerProfile?.officerRole);

  const highlights = await prisma.bulletinPost.findMany({
    where: { labId: null },
    take: 5,
    orderBy: [{ pinned: "desc" }, { postedAt: "desc" }],
    include: {
      author: { select: { firstName: true, lastName: true } },
      lab: { select: { labName: true } },
    },
  });
  console.log("bulletin", highlights.length);

  const leadership = await prisma.member.findMany({
    where: {
      membershipStatus: "ACTIVE",
      memberType: "OFFICER",
      officerProfile: { officerRole: { in: ["PRESIDENT", "SUPERVISOR"] } },
    },
    include: { officerProfile: { select: { officerRole: true } } },
    orderBy: { officerProfile: { officerRole: "asc" } },
  });
  console.log("leadership", leadership.length);

  const ledLabs = await prisma.lab.findMany({
    where: { leaderAssignments: { some: { memberId: member!.memberId } } },
    select: { labId: true, labName: true },
    orderBy: { labName: "asc" },
  });
  console.log("ledLabs", ledLabs.length);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
