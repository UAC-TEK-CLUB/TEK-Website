/**
 * Fail the build if Prisma WASM artifacts are missing (prevents broken cf:deploy).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MIN_BYTES = 500_000;
const errors = [];

function checkFile(label, path) {
  if (!existsSync(path)) {
    errors.push(`${label}: missing (${path})`);
    return;
  }
  const size = statSync(path).size;
  if (size < MIN_BYTES) {
    errors.push(`${label}: too small (${size} bytes)`);
  }
}

checkFile("public wasm", join("public", "query_compiler_bg.wasm"));
checkFile("open-next assets wasm", join(".open-next", "assets", "query_compiler_bg.wasm"));
checkFile(
  "server-function wasm",
  join(
    ".open-next",
    "server-functions",
    "default",
    "node_modules",
    ".prisma",
    "client",
    "query_compiler_bg.wasm"
  )
);

if (!existsSync(".open-next/worker.js")) {
  errors.push("open-next worker: missing (.open-next/worker.js)");
}

const headersPath = join(".open-next", "assets", "_headers");
if (!existsSync(headersPath)) {
  errors.push("assets _headers: missing");
} else {
  const headers = readFileSync(headersPath, "utf8");
  if (!headers.includes("query_compiler_bg.wasm")) {
    errors.push("assets _headers: missing WASM content-type rule");
  }
}

const prismaClient = join("node_modules", ".prisma", "client", "index.js");
if (!existsSync(prismaClient)) {
  errors.push("prisma client: missing");
} else {
  const src = readFileSync(prismaClient, "utf8");
  if (!src.includes("fetch('/query_compiler_bg.wasm')")) {
    errors.push("prisma client: WASM fetch patch not applied (run patch-prisma-client-wasm.mjs)");
  }
}

if (errors.length > 0) {
  console.error("[verify-cf-build] FAILED:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}

console.log("[verify-cf-build] OK — Prisma WASM + OpenNext bundle ready for deploy");
