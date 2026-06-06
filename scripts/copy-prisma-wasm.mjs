import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const wasmSrc = join("node_modules", ".prisma", "client", "query_compiler_bg.wasm");
const wasmDest = join(
  ".open-next",
  "server-functions",
  "default",
  "node_modules",
  ".prisma",
  "client",
  "query_compiler_bg.wasm"
);

if (!existsSync(wasmSrc)) {
  console.warn("[copy-prisma-wasm] source wasm not found, skipping");
  process.exit(0);
}

mkdirSync(dirname(wasmDest), { recursive: true });
copyFileSync(wasmSrc, wasmDest);
console.log("[copy-prisma-wasm] copied query_compiler_bg.wasm into OpenNext bundle");
