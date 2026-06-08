# Deploying TEK Website to Cloudflare

This app uses **Next.js 14**, **Prisma**, **Auth.js/NextAuth**, and **PostgreSQL**. It is wired for **Cloudflare Workers** via [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare@1.14.x`, compatible with Next 14.2.35).

Your **database** and **SMTP** stay **outside** Cloudflare (managed Postgres + mail provider). Optional **R2** can replace AWS S3 for uploads (same S3-compatible env vars pointing at R2).

---

## 1. What runs where

| Concern | Where |
|--------|--------|
| Web app | Cloudflare Worker (OpenNext bundle) |
| Postgres | [Neon](https://neon.tech), [Supabase](https://supabase.com), or any host with `sslmode=require` |
| Prisma migrations | Run `npx prisma migrate deploy` from CI or your laptop against prod `DATABASE_URL` |
| Secrets | `wrangler secret put …` or Cloudflare dashboard → Worker → Settings → Variables |

---

## 2. One-time local setup

```bash
npm install
npx wrangler login
```

Copy `.dev.vars.example` → `.dev.vars` for local Worker preview, and add the same keys you use in `.env` (see below).

---

## 3. Production environment variables

Set all of these for the **Worker** (Secrets for sensitive values). Match your existing `.env.example` names.

**Required**

- `DATABASE_URL` — PostgreSQL connection string (use the provider’s **pooling** / serverless URI if they offer one).
- `AUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` / `AUTH_URL` — Public site URL, e.g. `https://tek.example.com`
- `AUTH_TRUST_HOST` — `true` behind Cloudflare.

**Recommended**

- `APP_URL` — Same as public URL (emails, absolute links).
- SMTP vars if you send mail (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`).

**Optional**

- `S3_*` — Point to **Cloudflare R2** (S3-compatible) or leave unset if you only use external image URLs.
- `DISCORD_INVITE_URL`

Example (CLI):

```bash
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET
# …repeat for each secret
```

Non-secret vars can go in `wrangler.jsonc` under `[vars]` or in the dashboard.

---

## 4. Build and deploy (CLI)

```bash
npm run cf:build     # prisma generate + WASM patch + OpenNext bundle + verify
npm run cf:deploy    # cf:build + wrangler deploy + smoke tests
npm run cf:smoke     # re-run smoke tests against production (no redeploy)
```

`cf:build` **fails fast** if Prisma WASM artifacts are missing (`npm run cf:verify` checks the last build).

After deploy, `cf:smoke` checks homepage, login page, WASM asset, and (when `CF_SMOKE_USERNAME` / `CF_SMOKE_PASSWORD` are set) login → dashboard → home → bulletin.

Rename the Worker in `wrangler.jsonc` (`name`, and `services[0].service`) if you change the Worker name.

### Prisma WASM on Workers (required)

With `engineType = "client"`, Prisma loads `query_compiler_bg.wasm`. Workers have no `fs.readFileSync`, so the repo runs:

| Step | Script |
|------|--------|
| After `prisma generate` | `scripts/patch-prisma-client-wasm.mjs` — fetch fallback for Workers |
| Dev / preview | `scripts/sync-prisma-wasm-public.mjs` — copies WASM to `public/` |
| After OpenNext build | `scripts/copy-prisma-wasm.mjs` — copies WASM into `.open-next/assets` |
| Gate before deploy | `scripts/verify-cf-build.mjs` — aborts if WASM or patch is missing |

Do **not** skip these steps or run bare `opennextjs-cloudflare build` without `npm run cf:build`.

---

## 5. Prisma + Workers (runtime)

- Use a **Neon** (or other serverless) `DATABASE_URL` with `sslmode=require` in Wrangler secrets.
- `src/lib/prisma.ts` uses `@prisma/adapter-neon` with `maxUses: 1` and per-request `cache()` (required on Workers).
- If login returns 500 and logs show `fs.readFileSync` or `query_compiler_bg.wasm`, re-run `npm run cf:build` and deploy again.

Alternative if Workers are blocked by policy: **Docker** + **Cloudflare Tunnel** (see §10).

---

## 6. Git-connected deploy (Cloudflare dashboard)

1. **Workers & Pages** → **Create** → Connect your Git repository.
2. **Build command:** `npm ci && npm run cf:build`
3. **Deploy command:** `npx wrangler deploy` (or use the dashboard’s Wrangler integration; align with Cloudflare’s current “Workers Builds” docs).
4. Attach **secrets** in the project settings (same names as §3).
5. Run **`npx prisma migrate deploy`** once per release from CI (recommended) or manually before first traffic.

---

## 7. GitHub Actions (optional)

Add repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, plus your Worker secrets or use a deploy token with limited scope. Example job shape:

```yaml
# .github/workflows/deploy-cloudflare.yml (create if you want CI)
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run cf:build
      - run: npx opennextjs-cloudflare deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

You still need to expose `DATABASE_URL` etc. to the Worker via `wrangler secret` or dashboard.

---

## 8. Useful scripts (from `package.json`)

| Script | Purpose |
|--------|---------|
| `npm run db:generate` | `prisma generate` + WASM patch + `public/` copy |
| `npm run cf:build` | Full Workers bundle + `verify-cf-build` gate |
| `npm run cf:verify` | Re-check last `cf:build` artifacts |
| `npm run cf:smoke` | HTTP smoke tests against `CF_SMOKE_URL` (defaults to `wrangler.jsonc`) |
| `npm run cf:preview` | Build + local Worker runtime |
| `npm run cf:deploy` | Build + deploy + smoke |
| `npm run cf:typegen` | `cloudflare-env.d.ts` for bindings |

---

## 9. Static asset caching

`public/_headers` sets long-lived cache for `/_next/static/*` and `query_compiler_bg.wasm`. Adjust there if needed.

---

## 10. Alternative: Docker + Cloudflare Tunnel

If Workers are blocked by Prisma or ops policy:

```bash
docker build -t tek-website .
docker run -p 3000:3000 --env-file .env.production tek-website
```

Point [**Cloudflare Tunnel**](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) at `localhost:3000` and assign a `*.trycloudflare.com` or custom hostname.
