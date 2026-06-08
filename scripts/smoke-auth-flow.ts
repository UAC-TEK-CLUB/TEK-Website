/**
 * End-to-end auth smoke against Neon (same DB as production) + live HTTP checks.
 * Usage: DATABASE_URL=... npx tsx scripts/smoke-auth-flow.ts
 */
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

function neonUrl(): string {
  const url = process.env.DATABASE_URL!;
  return url
    .replace(/[?&]channel_binding=[^&]*/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
}

function createPrisma(): PrismaClient {
  return new PrismaClient({ adapter: new PrismaNeonHttp(neonUrl(), {}) });
}

const BASE = (
  process.env.CF_SMOKE_URL ?? "https://uactek.kojh0918.workers.dev"
).replace(/\/$/, "");

const testId = `smoke${Date.now().toString(36).slice(-6)}`;
const universityId = `U${testId}`;
const email = `${testId}@utah.edu`;
const username = `smoke_${testId}`.toLowerCase();
const password = "SmokeTest1!";

async function completeRegistrationDirect(
  prisma: PrismaClient,
  data: { token: string; username: string; password: string; expectedGraduation: Date }
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const application = await prisma.clubApplication.findUnique({
    where: { accountSetupToken: data.token },
    include: { applicant: true },
  });
  if (!application || application.status !== "APPROVED") {
    return { ok: false, error: "This setup link is invalid or has already been used." };
  }

  const existingBySchool = await prisma.member.findUnique({
    where: { universityId: application.applicant.universityId },
  });
  if (existingBySchool) {
    return { ok: false, error: "An account already exists for this application." };
  }

  const usernameTaken = await prisma.member.findUnique({
    where: { username: data.username },
  });
  if (usernameTaken) {
    return { ok: false, error: "That username is already taken. Pick another." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const member = await prisma.member.create({
    data: {
      username: data.username,
      universityId: application.applicant.universityId,
      email: application.applicant.email,
      firstName: application.applicant.firstName,
      lastName: application.applicant.lastName,
      passwordHash,
      memberType: "REGULAR",
      membershipStatus: "ACTIVE",
    },
  });
  await prisma.regularMember.create({
    data: { memberId: member.memberId, expectedGraduation: data.expectedGraduation },
  });
  await prisma.clubApplication.update({
    where: { clubAppId: application.clubAppId },
    data: { accountSetupToken: null },
  });
  return { ok: true, username: member.username };
}

async function cleanup(prisma: PrismaClient) {
  const member = await prisma.member.findUnique({ where: { username } });
  if (member) {
    await prisma.regularMember.deleteMany({ where: { memberId: member.memberId } });
    await prisma.member.delete({ where: { memberId: member.memberId } });
  }
  await prisma.clubApplication.deleteMany({ where: { applicantId: universityId } });
  await prisma.applicant.deleteMany({ where: { universityId } });
}

async function checkHttp(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.text();
  if (res.status !== 200 || body.includes("Application error")) {
    throw new Error(`HTTP ${path} failed (${res.status})`);
  }
  console.log(`  ✓ GET ${path}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL (Neon) to run auth flow smoke tests.");
  }

  const prisma = createPrisma();
  console.log("[smoke-auth-flow] Neon + HTTP checks\n");

  await cleanup(prisma);

  console.log("— Sign-up (approved application → register) —");
  const token = randomUUID();
  const visitor = await prisma.visitor.create({
    data: { ipAddress: "smoke-test", browserType: "smoke-auth-flow" },
  });
  await prisma.applicant.create({
    data: {
      universityId,
      firstName: "Smoke",
      lastName: "Test",
      email,
    },
  });
  await prisma.clubApplication.create({
    data: {
      applicantId: universityId,
      visitorId: visitor.visitorId,
      major: "Information Systems",
      codingExperience: "None",
      status: "APPROVED",
      accountSetupToken: token,
    },
  });
  console.log("  ✓ seeded approved application");

  console.log("— Register (completeRegistration) —");
  const reg = await completeRegistrationDirect(prisma, {
    token,
    username,
    password,
    expectedGraduation: new Date("2027-05-15T00:00:00.000Z"),
  });
  if (!reg.ok) {
    throw new Error(`completeRegistration failed: ${reg.error}`);
  }
  console.log(`  ✓ completeRegistration → ${reg.username}`);

  const member = await prisma.member.findUnique({ where: { username } });
  if (!member?.passwordHash) {
    throw new Error("member row missing after registration");
  }
  console.log("  ✓ member record in database");

  console.log("— Live pages —");
  await checkHttp("/login");
  await checkHttp("/apply");
  await checkHttp(`/register?token=${token}`);
  await checkHttp("/account/find-id");
  await checkHttp("/account/forgot-password");

  await cleanup(prisma);
  await prisma.visitor.delete({ where: { visitorId: visitor.visitorId } }).catch(() => {});

  console.log("\n[smoke-auth-flow] All auth flow checks passed.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n[smoke-auth-flow] FAILED:", err);
  process.exit(1);
});
