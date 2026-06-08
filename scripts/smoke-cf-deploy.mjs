/**
 * Post-deploy smoke tests for Cloudflare Workers.
 * Usage: CF_SMOKE_URL=https://... CF_SMOKE_USERNAME=... CF_SMOKE_PASSWORD=... node scripts/smoke-cf-deploy.mjs
 */
import { readFileSync } from "node:fs";

const BASE = (process.env.CF_SMOKE_URL ?? readWranglerUrl()).replace(/\/$/, "");
const USERNAME = process.env.CF_SMOKE_USERNAME;
const PASSWORD = process.env.CF_SMOKE_PASSWORD;
const MIN_WASM_BYTES = 500_000;

const failures = [];
const passes = [];

function readWranglerUrl() {
  try {
    const raw = readFileSync("wrangler.jsonc", "utf8");
    const urlMatch =
      raw.match(/"NEXTAUTH_URL"\s*:\s*"([^"]+)"/) ??
      raw.match(/"APP_URL"\s*:\s*"([^"]+)"/);
    if (urlMatch?.[1]) return urlMatch[1];

    const nameMatch = raw.match(/"name"\s*:\s*"([^"]+)"/);
    if (nameMatch?.[1]) {
      return `https://${nameMatch[1]}.kojh0918.workers.dev`;
    }
  } catch {
    /* ignore */
  }
  return "https://tek-website.kojh0918.workers.dev";
}

class CookieJar {
  #cookies = new Map();

  store(response) {
    const anyHeaders = response.headers;
    const setCookies =
      typeof anyHeaders.getSetCookie === "function"
        ? anyHeaders.getSetCookie()
        : anyHeaders.get("set-cookie")
          ? [anyHeaders.get("set-cookie")]
          : [];
    for (const line of setCookies) {
      if (!line) continue;
      const part = line.split(";")[0];
      const eq = part.indexOf("=");
      if (eq > 0) {
        this.#cookies.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
      }
    }
  }

  header() {
    return [...this.#cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

async function fetchText(path, init = {}) {
  const jar = init.jar;
  const headers = { ...(init.headers ?? {}) };
  if (jar?.header()) headers.cookie = jar.header();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    redirect: init.redirect ?? "follow",
  });
  if (jar) jar.store(res);
  const body = await res.text();
  return { res, body };
}

function pass(label) {
  passes.push(label);
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failures.push(`${label}: ${detail}`);
  console.error(`  ✗ ${label} — ${detail}`);
}

async function checkPublicRoute(path, expect = 200) {
  const { res, body } = await fetchText(path);
  if (res.status !== expect) {
    fail(`GET ${path}`, `HTTP ${res.status}, expected ${expect}`);
    return;
  }
  if (body.includes("Application error")) {
    fail(`GET ${path}`, "Application error in body");
    return;
  }
  pass(`GET ${path} → ${expect}`);
}

async function checkWasm() {
  const res = await fetch(`${BASE}/query_compiler_bg.wasm`, { method: "HEAD" });
  const type = res.headers.get("content-type") ?? "";
  const len = Number(res.headers.get("content-length") ?? 0);
  if (res.status !== 200) {
    fail("WASM asset", `HTTP ${res.status}`);
    return;
  }
  if (!type.includes("wasm")) {
    fail("WASM asset", `content-type=${type}`);
    return;
  }
  if (len > 0 && len < MIN_WASM_BYTES) {
    fail("WASM asset", `too small (${len} bytes)`);
    return;
  }
  pass(`WASM asset → 200 (${type})`);
}

async function loginAndCheckDashboard() {
  if (!USERNAME || !PASSWORD) {
    console.log("  ⊘ login flow skipped (set CF_SMOKE_USERNAME + CF_SMOKE_PASSWORD)");
    return;
  }

  const jar = new CookieJar();

  const csrf = await fetchText("/api/auth/csrf", { jar });
  let csrfToken;
  try {
    csrfToken = JSON.parse(csrf.body).csrfToken;
  } catch {
    fail("login CSRF", "invalid JSON");
    return;
  }
  if (!csrfToken) {
    fail("login CSRF", "missing csrfToken");
    return;
  }
  pass("auth CSRF token");

  const form = new URLSearchParams({
    csrfToken,
    username: USERNAME,
    password: PASSWORD,
    callbackUrl: "/dashboard",
    json: "true",
  });

  const login = await fetchText("/api/auth/callback/credentials", {
    method: "POST",
    jar,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });

  if (login.res.status !== 200 && login.res.status !== 302) {
    fail("login POST", `HTTP ${login.res.status}`);
    return;
  }
  if (login.body.includes("error") && login.body.includes("CredentialsSignin")) {
    fail("login POST", "invalid credentials");
    return;
  }
  pass("login POST");

  const dash = await fetchText("/dashboard", { jar });
  if (dash.res.status !== 200) {
    fail("GET /dashboard (authed)", `HTTP ${dash.res.status}`);
    return;
  }
  if (dash.body.includes("Application error")) {
    fail("GET /dashboard (authed)", "Application error");
    return;
  }
  pass("GET /dashboard (authed)");

  const home = await fetchText("/", { jar });
  if (home.res.status !== 200 || home.body.includes("Application error")) {
    fail("GET / (authed)", `HTTP ${home.res.status} or app error`);
    return;
  }
  pass("GET / (authed, Navbar home)");

  const bulletin = await fetchText("/bulletin", { jar });
  if (bulletin.res.status !== 200 || bulletin.body.includes("Application error")) {
    fail("GET /bulletin (authed)", `HTTP ${bulletin.res.status} or app error`);
    return;
  }
  pass("GET /bulletin (authed)");
}

console.log(`[smoke-cf-deploy] ${BASE}\n`);

await checkPublicRoute("/");
await checkPublicRoute("/login");
await checkPublicRoute("/apply");
await checkWasm();
await loginAndCheckDashboard();

console.log(`\n[smoke-cf-deploy] ${passes.length} passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
