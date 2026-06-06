# UAC TEK Club

Next.js 14 + TypeScript + Prisma + PostgreSQL portal for the UAC TEK Club —
the University of Utah Asia Campus coding & analytics society.
Styled with Tailwind CSS, shadcn/ui, and Lucide React.

## Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS, shadcn/ui, Lucide icons
- **Auth:** Auth.js (NextAuth v5) with Prisma adapter, credentials provider
- **DB / ORM:** PostgreSQL + Prisma 6
- **Validation:** Zod

## Getting started

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
├── legacy/                          Frozen Django reference UI
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
│   │   ├── ui/                      shadcn primitives
│   │   ├── layout/                  Navbar, Sidebar, Footer
│   │   ├── identity/                Member, mentor, role components
│   │   ├── recruitment/             Application & approval components
│   │   ├── labs/                    Lab catalogue, proposal, roster
│   │   ├── meetings/                Calendar, attendance
│   │   ├── community/               Bulletin, gallery, chat, tutoring
│   │   └── admin/                   Health dashboard
│   ├── server/actions/              One file per domain: identity, recruitment, labs, meetings, community, admin
│   ├── lib/
│   │   ├── prisma.ts                Singleton client
│   │   ├── auth.ts                  NextAuth v5 config
│   │   ├── permissions.ts           requireMember(), requireOfficer(level)
│   │   ├── validators/              Zod schemas
│   │   └── utils.ts
│   ├── middleware.ts                Auth gates + visitor cookie
│   └── types/                       NextAuth + global module declarations
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Phase status

- [x] **Phase 0** — Archive Django app to `legacy/`, scaffold Next.js + Tailwind + shadcn, install Prisma, NextAuth v5, Zod, Lucide
- [x] **Phase 1** — DB & Identity: schema.prisma, NextAuth credentials, ISA-aware register/login/profile/mentor UI
- [x] **Phase 2** — Recruitment: visitor cookie middleware, public application form, officer applicant queue with approve→Member transaction
- [x] **Phase 3** — Labs & Operations: lab catalogue, member lab applications, lab proposals, officer review (auto-creates Lab on approval)
- [x] **Phase 4** — Events & Attendance: meetings CRUD, member check-in, officer attendance reports (M:N AttendanceRecord)
- [x] **Phase 5** — Community & Admin: bulletin board with pinning, gallery uploads, 1:1 chat, tutoring scheduler, website health logs

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed bootstrap officer + sample labs/meeting |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | ESLint |
| `npm run cf:build` | OpenNext bundle for **Cloudflare Workers** |
| `npm run cf:deploy` | Build + `wrangler deploy` (see `docs/deploy-cloudflare.md`) |

## Deploying to Cloudflare (Workers)

The repo includes **OpenNext for Cloudflare** (`wrangler.jsonc`, `open-next.config.ts`, `npm run cf:*`). Full steps, secrets, and Prisma notes: **[docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)**.

**Alternative:** run the **`Dockerfile`** on any host and optionally front it with a **Cloudflare Tunnel** (same doc).

## Deploying to AWS (handoff guide)

The app is built database-agnostic; switching from local Postgres to AWS RDS / Aurora is a `DATABASE_URL` change plus running migrations. Recommended hosts: **AWS Amplify** or **ECS + Fargate** for the Next.js app, **RDS for PostgreSQL** for the database.

1. Provision a Postgres database (RDS Postgres 16, `db.t4g.micro` is enough for early stage). Note the endpoint and credentials.
2. On the Next.js host, set production environment variables (mirror everything in `.env.example`):
   ```
   DATABASE_URL=postgresql://USER:PASS@<rds-endpoint>:5432/tek_club?sslmode=require
   AUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://<your-domain>
   AUTH_TRUST_HOST=true
   S3_ENDPOINT=...   S3_BUCKET=...   S3_ACCESS_KEY_ID=...   S3_SECRET_ACCESS_KEY=...   S3_PUBLIC_URL=...
   APP_URL=https://<your-domain>
   SMTP_HOST=email-smtp.<region>.amazonaws.com   SMTP_PORT=587   SMTP_USER=<ses-smtp-user>   SMTP_PASSWORD=<ses-smtp-password>   EMAIL_FROM="UAC TEK Club <noreply@your-domain>"
   ```
3. Apply the committed migrations to RDS (do **not** run `migrate dev` against prod):
   ```bash
   npm run db:deploy
   ```
4. Optional first-run seed:
   ```bash
   npm run db:seed
   ```
5. Build and start:
   ```bash
   npm run build && npm start
   ```

The committed `prisma/migrations/` directory is the source of truth for the schema. Any future schema change must go through `npm run db:migrate -- --name <change-name>` locally, then be committed and applied in prod via `db:deploy`.

## Notes for production

- **Gallery uploads:** the `PhotoUploader` component currently accepts a public URL. Wire S3-compatible presigned uploads (R2 / Supabase Storage) before launch — see `.env.example` `S3_*` variables.
- **Realtime chat:** `ChatThread` polls on `router.refresh()` after sends. For production, swap in Supabase Realtime or Pusher Channels per the Phase 5 plan.
- **Email:** transactional email (acceptance / pending / rejection) is sent via SMTP using `nodemailer`. If `SMTP_HOST` is unset (e.g. in local dev) the emails are written to the server console instead, so the flow still works without a provider. Recommended providers:
  - **AWS SES** — best fit for the AWS deployment path. Verify a sending domain in SES, request production access (out of sandbox), then create SMTP credentials and plug them into `SMTP_*`.
  - **Gmail App Password** — fine for early demos. Enable 2FA on the Google account, generate an App Password, set `SMTP_HOST=smtp.gmail.com`, `SMTP_USER=<gmail address>`, `SMTP_PASSWORD=<app password>`.
  - **Resend** — `SMTP_HOST=smtp.resend.com`, `SMTP_USER=resend`, `SMTP_PASSWORD=<RESEND_API_KEY>`.
  Officers also still see the `/register?token=...` URL in the approval dialog so they can share it manually as a fallback.
- **Visitor logging:** middleware sets a `tek_visitor_id` cookie. The `Visitor` row is created when an applicant submits a form; you can extend the middleware to write rows directly if you want pure traffic logs.
