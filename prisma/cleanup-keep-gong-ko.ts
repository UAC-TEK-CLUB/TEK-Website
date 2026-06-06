/**
 * One-off: keep only Byoung-gyu Gong and Jung Ko; remove other members and
 * content they authored (bulletin, lab spotlights on their labs).
 *
 * Run: npx tsx prisma/cleanup-keep-gong-ko.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KEEP = [
  { firstName: "Byoung-gyu", lastName: "Gong" },
  { firstName: "Jung", lastName: "Ko" },
] as const;

async function main() {
  const keepMembers = await prisma.member.findMany({
    where: {
      OR: KEEP.map((n) => ({ firstName: n.firstName, lastName: n.lastName })),
    },
    select: { memberId: true, firstName: true, lastName: true },
  });

  if (keepMembers.length !== 2) {
    throw new Error(
      `Expected exactly 2 keep members, found ${keepMembers.length}: ${JSON.stringify(keepMembers)}`
    );
  }

  const keepIds = keepMembers.map((m) => m.memberId);
  console.log("Keeping:", keepMembers.map((m) => `${m.firstName} ${m.lastName}`).join(", "));

  // Delete spotlights on labs that have ANY leader outside the keep list
  const labsWithOutsideLeaders = await prisma.lab.findMany({
    where: {
      leaderAssignments: { some: { memberId: { notIn: keepIds } } },
      spotlight: { isNot: null },
    },
    select: { labId: true, labName: true },
  });
  const spotlightDelete = await prisma.leaderProject.deleteMany({
    where: { labId: { in: labsWithOutsideLeaders.map((l) => l.labId) } },
  });
  console.log(
    "Removed lab spotlights:",
    labsWithOutsideLeaders.map((l) => l.labName).join(", ") || "(none)",
    `(${spotlightDelete.count} rows)`
  );

  const bulletinRemoved = await prisma.bulletinPost.deleteMany({
    where: { authorId: { notIn: keepIds } },
  });
  console.log("Removed bulletin posts by others:", bulletinRemoved.count);

  const clubApps = await prisma.clubApplication.deleteMany({});
  const applicants = await prisma.applicant.deleteMany({});
  console.log("Removed club applications:", clubApps.count, "| applicants:", applicants.count);

  const membersRemoved = await prisma.member.deleteMany({
    where: { memberId: { notIn: keepIds } },
  });
  console.log("Removed members:", membersRemoved.count);

  const remaining = await prisma.member.findMany({
    select: {
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      officerProfile: { select: { officerRole: true } },
    },
  });
  const posts = await prisma.bulletinPost.count();
  const spotlights = await prisma.leaderProject.findMany({
    include: { lab: { select: { labName: true } } },
  });

  console.log("\nRemaining members:", remaining);
  console.log("Remaining bulletin posts:", posts);
  console.log(
    "Remaining spotlights:",
    spotlights.map((s) => `${s.lab.labName}: ${s.title}`)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
