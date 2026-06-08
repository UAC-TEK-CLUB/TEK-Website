import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { cache } from "react";

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

/** Neon HTTP driver avoids WebSocket 530 errors on Cloudflare Workers. */
function neonConnectionString(url: string): string {
  const normalized = url
    .replace(/[?&]channel_binding=[^&]*/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
  return normalized.includes("sslmode=") ? normalized : `${normalized}?sslmode=require`;
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  const log =
    process.env.NODE_ENV === "development" ? (["query", "error", "warn"] as const) : (["error"] as const);

  if (isLocalDatabase(url)) {
    // Lazy require keeps `pg` out of the Cloudflare Worker bundle (Neon-only in prod).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
    const pool = new Pool({ connectionString: url.replace(/\?.*$/, "") });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter, log: [...log] });
  }

  const adapter = new PrismaNeonHttp(neonConnectionString(url), {});
  return new PrismaClient({ adapter, log: [...log] });
}

/** One client per request; global singletons cause cross-request I/O errors on Workers. */
const getPrismaClient = cache(createPrismaClient);

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
