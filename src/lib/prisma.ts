import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/** Dynamic access so Next.js build does not inline localhost DATABASE_URL into the Worker bundle. */
function getDatabaseUrl(): string {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

function isLocalDatabase(url: string): boolean {
  try {
    const { hostname } = new URL(url.replace(/^postgresql:\/\//, "postgres://").replace(/\?.*$/, ""));
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  const log =
    process.env.NODE_ENV === "development" ? (["query", "error", "warn"] as const) : (["error"] as const);

  if (isLocalDatabase(url)) {
    const pool = new Pool({ connectionString: url.replace(/\?.*$/, "") });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter, log: [...log] });
  }

  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter, log: [...log] });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
