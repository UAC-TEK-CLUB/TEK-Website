# UAC TEK Club

Next.js 14 + TypeScript + Prisma + PostgreSQL portal for the UAC TEK Club —
the University of Utah Asia Campus coding & analytics society.
Styled with Tailwind CSS, shadcn/ui, and Lucide React.

**Repository:** [github.com/UAC-TEK-CLUB/TEK-Website](https://github.com/UAC-TEK-CLUB/TEK-Website)

## Live site

| | URL |
|---|-----|
| **Current (interim)** | **https://uactek.kojh0918.workers.dev** |
| **Target** | `https://www.uactekclub.com` (custom domain — see [Next steps](#next-steps)) |

Hosted on **Cloudflare Workers** via OpenNext. Configuration: `wrangler.jsonc`. Full deploy runbook: **[docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)**.

## Production hosting

| Layer | Service |
|-------|---------|
| Web app | Cloudflare Worker (`npm run cf:deploy`) |
| Database | Neon PostgreSQL (`DATABASE_URL` — Worker secret) |
| Auth | Auth.js (NextAuth v5), username + password, JWT sessions |
| Secrets | `DATABASE_URL`, `AUTH_SECRET` (and optional `SMTP_*`) — **never commit** |

Deploy from your machine:

```bash
npm run cf:deploy   # build → wrangler deploy → smoke tests
```

## Next steps

A **custom domain** is required before sharing the site widely with members.

The URL members use must match what the app is configured with:

- `NEXTAUTH_URL` and `APP_URL` in `wrangler.jsonc` (and Worker secrets if you override them in the dashboard)
- Links in transactional email (application approval, password reset, find-id)

If members visit `www.uactekclub.com` but the app still thinks the site is `*.workers.dev`, login, redirects, and email links can break. **The public URL and config must match.**

### When the domain is ready

1. **Cloudflare dashboard** → Worker `uactek` → **Custom domains** → add `www.uactekclub.com` (and apex if desired).
2. Update `wrangler.jsonc`:
   ```jsonc
   "NEXTAUTH_URL": "https://www.uactekclub.com",
   "APP_URL": "https://www.uactekclub.com"
   ```
3. Redeploy: `npm run cf:deploy`
4. Stop sharing the `*.workers.dev` URL with members (optionally remove the workers.dev route under Workers & Pages → Triggers).
5. **Email on your domain** — verify the sending domain with a provider (Resend is documented in `.env.example`), then set Worker secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` (e.g. `UAC TEK Club <noreply@uactekclub.com>`). Until SMTP is set, emails are logged to the Worker console and officers can copy setup links from the admin UI.

See **[docs/deploy-cloudflare.md § Custom domain & email](docs/deploy-cloudflare.md)** for the full checklist.

## Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS, shadcn/ui, Lucide icons
- **Auth:** Auth.js (NextAuth v5), credentials provider, JWT sessions (no OAuth)
- **DB / ORM:** PostgreSQL + Prisma 6
- **Validation:** Zod

## Getting started (local)

```bash
cp .env.example .env
# fill in DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)

npm install
npx prisma migrate dev --name init
npm run db:seed       # creates one bootstrap officer (login = SEED_OFFICER_*)
npm run dev
```

The seeded **president** account defaults to:

- **Username** (site login): `tek0001`
- **Password:** `ChangeMeNow!`

The seed also stores an official **university / campus ID** on that member record (`TEK0001` by default, via `SEED_OFFICER_UNIVERSITY_ID`) for roster display — it is not used to sign in. New members pick their own username when they complete registration from an approved application.

### Use your own email and IDs for local testing

1. Open your **`.env`** (create from `.env.example` if needed).
2. Set the seed variables **before** you run `npm run db:seed` the first time, or keep the same `SEED_OFFICER_UNIVERSITY_ID` as the row already in the database if you only want to change login/email/password and re-seed:
   - **`SEED_OFFICER_USERNAME`** — what you type at `/login` (letters, numbers, underscores; stored lowercase). Example: `jeonghun_p`.
   - **`SEED_OFFICER_PASSWORD`** — your test password (min 8 characters in the app).
   - **`SEED_OFFICER_EMAIL`** — your real or test inbox (used for profile / contact; must stay unique in the DB).
   - **`SEED_OFFICER_UNIVERSITY_ID`** — your official campus ID string for rosters (must match the upsert key if you are **re-running** seed on an existing DB; otherwise you can get a second bootstrap row). To switch to a new campus ID on a dirty dev DB, remove the old seed `members` row in Prisma Studio or run `npx prisma migrate reset` (wipes data) then seed again.
   - Optional: **`SEED_OFFICER_FIRST_NAME`**, **`SEED_OFFICER_LAST_NAME`** — how your name appears in the app (defaults: Founding President).
3. Run **`npm run db:seed`** (or `npx prisma db seed`).
4. Start the app and sign in at **`/login`** with **username + password** (not email).

### Testing other officers and members

- **More members (including future officers):** use **`/apply`** with a different university ID and email per person. An **executive** (president or supervisor) approves under **`/admin/applicants`**. Each approved applicant gets a setup link (email in dev may print to the server console if SMTP is unset); they choose a **username** and password on **`/register?token=...`**.
- **Promote someone to officer:** after they have an account, the **president** opens **`/admin/members`** and uses the promote flow so leaders get officer tools.

## Repo structure

```
TEK-Website/
├── legacy/                          Frozen Django archive (not deployed; see legacy/README.md)
├── prisma/
│   ├── schema.prisma                BCNF schema (Members, Officers, Labs, etc.)
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/                Visitor-facing routes
│   │   ├── (member)/                Auth-gated member routes
│   │   ├── (officer)/admin/         Officer-only admin routes
│   │   ├── login/, register/        Auth pages
│   │   └── api/auth/[...nextauth]/  NextAuth handler
│   ├── components/
│   ├── server/actions/              Server Actions per domain
│   ├── lib/                         prisma, auth, permissions, validators
│   └── middleware.ts                Auth gates + visitor cookie
├── docs/deploy-cloudflare.md        Production deploy runbook
├── wrangler.jsonc                   Cloudflare Worker config
└── package.json
```

## Architecture (code organization)

| Layer | Location | Role |
|-------|----------|------|
| Routes (URLs) | `src/lib/routes.ts` | Single source for path builders (`routes.lab()`, `routes.meetingsList()`, …) |
| Cache invalidation | `src/lib/revalidate.ts` | Bundled `revalidatePath` calls after server actions |
| Constants | `src/lib/constants.ts` | Shared cookies, upload limits, image prefixes |
| Env | `src/lib/env.ts` | SMTP, S3, `APP_URL`, `AUTH_SECRET` getters |
| Session shape | `src/lib/session.ts` | `SessionLike` for access-control helpers |
| Validators | `src/lib/validators/` | Zod schemas; shared primitives in `common.ts` |
| Server actions | `src/server/actions/` | One file per domain (identity, labs, meetings, …) |
| Access control | `src/lib/permissions.ts`, `labAccess.ts`, `galleryAccess.ts` | `requireMember`, `requireSiteAdmin`, lab-scoped checks |
| UI shells | `src/components/layout/` | `AuthPageShell`, `MemberShell`, `MemberSidebar` |

Public forms that must not throw (apply, register) return `{ ok, error? }` via helpers in `src/lib/actionResult.ts`. Admin actions continue to throw on invalid input.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build (Node host) |
| `npm run db:migrate` | Run Prisma migrations (local) |
| `npm run db:deploy` | Apply migrations to production DB |
| `npm run db:seed` | Seed bootstrap officer + sample labs/meeting |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | ESLint |
| `npm run cf:build` | Prisma WASM patch + OpenNext bundle + verify gate |
| `npm run cf:verify` | Re-check last `cf:build` (WASM + patch present) |
| `npm run cf:smoke` | Post-deploy HTTP smoke tests (login optional via env) |
| `npm run cf:smoke:auth` | Neon sign-up/register smoke tests |
| `npm run cf:deploy` | `cf:build` + deploy + smoke |

## Deploying to Cloudflare (Workers)

The repo includes **OpenNext for Cloudflare** (`wrangler.jsonc`, `open-next.config.ts`, `npm run cf:*`). Full steps, secrets, Prisma WASM, custom domain, and email: **[docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)**.

An optional **Docker + Cloudflare Tunnel** fallback is documented in the same file if Workers are not an option.

## Notes for production

- **Public URL alignment:** `NEXTAUTH_URL`, `APP_URL`, and the domain members bookmark must be identical (see [Next steps](#next-steps)).
- **Gallery uploads:** the `PhotoUploader` component currently accepts a public URL. Wire S3-compatible presigned uploads (R2 / Supabase Storage) before relying on member uploads — see `.env.example` `S3_*` variables.
- **Realtime chat:** `ChatThread` polls on `router.refresh()` after sends. For live updates, consider Supabase Realtime or Pusher Channels.
- **Email:** transactional email (acceptance / pending / rejection / recovery) uses SMTP via `nodemailer`. If `SMTP_HOST` is unset, emails are written to the server console. For production, verify your club domain with **Resend** (see `.env.example`) and set `SMTP_*` + `EMAIL_FROM` on the Worker. Officers can still copy `/register?token=...` from the approval dialog as a fallback.
- **Visitor logging:** middleware sets a `tek_visitor_id` cookie. The `Visitor` row is created when an applicant submits a form.

## Development history

Phases 0–5 (Django archive → identity → recruitment → labs → meetings → community) are complete. The original Django app lives in `legacy/` (read-only archive; restore via `git checkout v0-django-snapshot` if needed).
