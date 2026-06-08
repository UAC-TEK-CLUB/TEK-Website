/**
 * Prisma engineType=client loads query_compiler_bg.wasm via fs.readFileSync.
 * Cloudflare Workers have no fs — patch generated clients to fetch the WASM asset.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = join("node_modules", ".prisma", "client");
const PATCHED_MARKER = "fetch('/query_compiler_bg.wasm')";

const UNPATCHED_RE =
  /getQueryCompilerWasmModule: async \(\) => \{[\s\S]*?readFileSync\([\s\S]*?return new WebAssembly\.Module\([^)]+\)\s*\}/;

const PATCHED_BLOCK = `getQueryCompilerWasmModule: async () => {
        const path = require('path')
        const fs = require('fs')
        const wasmPath = path.join(config.dirname, 'query_compiler_bg.wasm')
        let bytes
        try {
          bytes = fs.readFileSync(wasmPath)
        } catch {
          const res = await fetch('/query_compiler_bg.wasm')
          if (!res.ok) {
            throw new Error('Failed to load Prisma query_compiler_bg.wasm: HTTP ' + res.status)
          }
          bytes = new Uint8Array(await res.arrayBuffer())
        }
        return new WebAssembly.Module(bytes)
      }`;

function patchFile(filePath) {
  if (!existsSync(filePath)) return "missing";

  const source = readFileSync(filePath, "utf8");
  if (source.includes(PATCHED_MARKER)) return "already";
  if (!UNPATCHED_RE.test(source)) return "skipped";

  const next = source.replace(UNPATCHED_RE, PATCHED_BLOCK);
  writeFileSync(filePath, next);
  return "patched";
}

if (!existsSync(CLIENT_DIR)) {
  console.warn("[patch-prisma-client-wasm] .prisma/client not found — run prisma generate first");
  process.exit(0);
}

const targets = readdirSync(CLIENT_DIR)
  .filter((name) => name.endsWith(".js") && !name.endsWith(".wasm.js"))
  .map((name) => join(CLIENT_DIR, name));

let patched = 0;
let already = 0;
const problems = [];

for (const file of targets) {
  const result = patchFile(file);
  if (result === "patched") {
    patched++;
    console.log("[patch-prisma-client-wasm] patched", file);
  } else if (result === "already") {
    already++;
  } else if (result === "skipped" && file.endsWith("index.js")) {
    problems.push(file);
  }
}

if (problems.length > 0) {
  console.error(
    "[patch-prisma-client-wasm] index.js has no recognizable readFileSync WASM loader — update the patch script"
  );
  process.exit(1);
}

if (patched === 0 && already === 0) {
  console.error("[patch-prisma-client-wasm] no files patched or already patched");
  process.exit(1);
}

console.log(`[patch-prisma-client-wasm] done (${patched} patched, ${already} already ok)`);
