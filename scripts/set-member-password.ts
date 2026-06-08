/**
 * Set a member's login password. Uses DATABASE_URL from the environment.
 *
 * Local:
 *   npx tsx scripts/set-member-password.ts kojh0518 'Qwer2345!'
 *
 * Production (Neon) — paste your Neon URL on the SAME line:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/set-member-password.ts kojh0518 'Qwer2345!'
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const username = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: DATABASE_URL=... npx tsx scripts/set-member-password.ts <username> '<password>'");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

function isLocalDatabase(connectionString: string): boolean {
  try {
    const { hostname } = new URL(
      connectionString.replace(/^postgresql:\/\//, "postgres://").replace(/\?.*$/, "")
    );
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function createClient(): PrismaClient {
  if (isLocalDatabase(url!)) {
    const pool = new Pool({ connectionString: url!.replace(/\?.*$/, "") });
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url! }) });
}

async function main() {
  const prisma = createClient();
  try {
    const host = new URL(url!.replace(/^postgresql:\/\//, "postgres://").replace(/\?.*$/, "")).hostname;
    const member = await prisma.member.findUnique({
      where: { username },
      select: { memberId: true, username: true, firstName: true, lastName: true },
    });
    if (!member) {
      console.error(`No member with username "${username}" on ${host}`);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.member.update({ where: { memberId: member.memberId }, data: { passwordHash } });
    console.log(
      `Password updated for ${member.firstName} ${member.lastName} (${member.username}) on ${host}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
