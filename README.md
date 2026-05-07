# TEK Club Management Portal

Next.js 14 + TypeScript + Prisma + PostgreSQL portal for the UAC TEK Club.
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

The seeded officer credentials default to:

- **University ID:** `TEK0001`
- **Password:** `ChangeMeNow!`

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
├── next.config.js
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
- **Email:** approval emails are not yet sent — `decideApplication` returns the temp password to the officer UI for manual delivery.
- **Visitor logging:** middleware sets a `tek_visitor_id` cookie. The `Visitor` row is created when an applicant submits a form; you can extend the middleware to write rows directly if you want pure traffic logs.
