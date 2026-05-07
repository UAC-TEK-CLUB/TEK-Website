import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const universityId = process.env.SEED_OFFICER_UNIVERSITY_ID ?? "TEK0001";
  const email = process.env.SEED_OFFICER_EMAIL ?? "admin@tek.club";
  const password = process.env.SEED_OFFICER_PASSWORD ?? "ChangeMeNow!";
  const passwordHash = await bcrypt.hash(password, 10);

  const officer = await prisma.member.upsert({
    where: { universityId },
    update: {},
    create: {
      universityId,
      email,
      firstName: "Founding",
      lastName: "Officer",
      passwordHash,
      memberType: "OFFICER",
      membershipStatus: "ACTIVE",
      officerProfile: {
        create: { adminAccessLevel: 5 },
      },
    },
    include: { officerProfile: true },
  });

  await prisma.lab.upsert({
    where: { labName: "Web Lab" },
    update: {},
    create: {
      labName: "Web Lab",
      description: "Frontend and full-stack web engineering.",
      objective: "Ship student-built web products end-to-end.",
    },
  });
  await prisma.lab.upsert({
    where: { labName: "ML Lab" },
    update: {},
    create: {
      labName: "ML Lab",
      description: "Applied machine learning and data science.",
      objective: "Run group projects from notebook to deployment.",
    },
  });

  await prisma.meeting.upsert({
    where: { meetingId: "seed-kickoff" },
    update: {},
    create: {
      meetingId: "seed-kickoff",
      title: "Semester Kickoff",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: "GENERAL",
      location: "Main Auditorium",
    },
  });

  console.log("Seeded officer:", officer.universityId, "/ password from env");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
