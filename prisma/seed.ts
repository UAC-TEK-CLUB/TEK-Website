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
      lastName: "President",
      passwordHash,
      memberType: "OFFICER",
      membershipStatus: "ACTIVE",
      officerProfile: {
        create: { adminAccessLevel: 5, officerRole: "PRESIDENT" },
      },
    },
    include: { officerProfile: true },
  });

  // Make sure an existing seeded record becomes PRESIDENT even if the row was
  // created before this column existed.
  await prisma.clubOfficer.update({
    where: { memberId: officer.memberId },
    data: { officerRole: "PRESIDENT", adminAccessLevel: 5 },
  });

  const labs = [
    {
      labName: "Excel Lab",
      description:
        "Spreadsheet engineering, financial modeling, and business analytics with Excel and Google Sheets.",
      objective:
        "Build practical spreadsheet fluency and ship reusable templates the whole club can use.",
    },
    {
      labName: "Stock Lab",
      description:
        "Stock price prediction and algorithmic trading — quantitative research, backtesting, and live paper trading.",
      objective:
        "Design, backtest, and ship at least one trading strategy each semester.",
    },
    {
      labName: "Fitness App Lab",
      description:
        "Mobile and web fitness applications — workout tracking, nutrition, wearables integration.",
      objective:
        "Ship a polished fitness app to real users by end of the academic year.",
    },
    {
      labName: "AI Contents Lab",
      description:
        "AI content creation tools — generative video, image, copy, and multimodal pipelines.",
      objective:
        "Prototype creator-facing AI tooling and publish demos / open-source experiments.",
    },
    {
      labName: "Student Scheduler Lab",
      description:
        "A college student scheduling platform — class planning, study sessions, and group coordination.",
      objective:
        "Launch a scheduling product real students on campus actually use.",
    },
    {
      labName: "Startup Accelerator Lab",
      description:
        "Platform for early-stage student startups — pitches, mentorship matching, milestones, and funding workflows.",
      objective:
        "Build the operating system for the campus startup ecosystem.",
    },
  ];

  for (const lab of labs) {
    await prisma.lab.upsert({
      where: { labName: lab.labName },
      update: { description: lab.description, objective: lab.objective },
      create: lab,
    });
  }

  await prisma.lab.deleteMany({
    where: { labName: { in: ["Web Lab", "ML Lab"] } },
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
