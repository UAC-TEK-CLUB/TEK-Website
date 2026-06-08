/** After OpenNext build: sync Prisma WASM + static headers into the deploy bundle. */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const wasmSrc = join("node_modules", ".prisma", "client", "query_compiler_bg.wasm");
const MIN_BYTES = 500_000;

if (!existsSync(wasmSrc)) {
  console.error("[copy-prisma-wasm] source wasm not found — run prisma generate first");
  process.exit(1);
}

const size = statSync(wasmSrc).size;
if (size < MIN_BYTES) {
  console.error(`[copy-prisma-wasm] wasm file too small (${size} bytes)`);
  process.exit(1);
}

const destinations = [
  join("public", "query_compiler_bg.wasm"),
  join(
    ".open-next",
    "server-functions",
    "default",
    "node_modules",
    ".prisma",
    "client",
    "query_compiler_bg.wasm"
  ),
  join(".open-next", "assets", "query_compiler_bg.wasm"),
];

for (const dest of destinations) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(wasmSrc, dest);
  console.log("[copy-prisma-wasm] copied to", dest);
}

const headersSrc = join("public", "_headers");
const headersDest = join(".open-next", "assets", "_headers");
if (existsSync(headersSrc)) {
  mkdirSync(dirname(headersDest), { recursive: true });
  copyFileSync(headersSrc, headersDest);
  console.log("[copy-prisma-wasm] copied to", headersDest);
} else {
  console.error("[copy-prisma-wasm] public/_headers missing");
  process.exit(1);
}
