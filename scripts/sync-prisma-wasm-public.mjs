/** Copy Prisma WASM to public/ so Workers can fetch /query_compiler_bg.wasm (dev + preview). */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const wasmSrc = join("node_modules", ".prisma", "client", "query_compiler_bg.wasm");
const wasmDest = join("public", "query_compiler_bg.wasm");

if (!existsSync(wasmSrc)) {
  console.warn("[sync-prisma-wasm-public] source wasm not found, skipping");
  process.exit(0);
}

mkdirSync(dirname(wasmDest), { recursive: true });
copyFileSync(wasmSrc, wasmDest);
console.log("[sync-prisma-wasm-public] copied to public/query_compiler_bg.wasm");
