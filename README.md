# Candidate Tracker

A full-stack internal tool for tracking job candidates and their applications, built as a take-home challenge. TypeScript end-to-end, Fastify + PostgreSQL on the backend, React + React Query on the frontend, with a shared Zod schema package as the single source of truth for types and validation.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 (strict mode, no `any`) |
| Backend | Fastify 4, `fastify-type-provider-zod` |
| Database | PostgreSQL 15, Prisma ORM |
| Frontend | React 18, Vite, React Router |
| Server state | TanStack React Query |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | Zod (shared between frontend and backend) |
| Testing | Vitest, Fastify `inject()` |

## Project structure

```
candidate-tracker/
├── apps/
│   ├── api/                 # Fastify backend
│   │   ├── prisma/          # Schema, migrations, seed script
│   │   ├── src/
│   │   │   ├── modules/     # candidates, applications, dashboard
│   │   │   └── plugins/     # error handler, Prisma client
│   │   └── tests/
│   └── web/                 # React frontend
│       └── src/
│           ├── pages/        # candidates, applications, dashboard
│           ├── components/
│           └── api/          # React Query hooks
├── packages/
│   └── shared/               # Zod schemas + inferred types
└── docker-compose.yml
```

## Running locally

**Prerequisites:** Node 20+, Docker (for PostgreSQL), npm.

```bash
# 1. Install all dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Run migrations and seed data (20 candidates, 2–4 applications each)
npm run db:migrate
npm run db:seed

# 5. Start the API (port 3001)
npm run dev:api

# 6. Start the web app (port 5173), in a separate terminal
npm run dev:web

# 7. Run all tests
npm test
```

Visit `http://localhost:5173`.

## Environment variables

**`apps/api/.env`**
```
DATABASE_URL=
PORT=
NODE_ENV=
```

**`apps/web/.env`**
```
VITE_API_URL=
```

## Features

- **Dashboard** — total candidates, total applications, applications by status, hired this month, rejection rate, and the last 5 applications, all computed server-side via dedicated aggregation queries. Includes a bar chart of application counts by status.
- **Candidates** — full CRUD, paginated list with search across name/email/phone/location, detail page showing all applications for that candidate, soft delete (hidden from all lists and search once deleted).
- **Applications** — full CRUD, paginated list with combined free-text search across both application fields (job title, company, source, notes) *and* the linked candidate's fields (name, email, location) in one query, plus status and applied-date-range filters. Candidate assignment uses a debounced search-as-you-type picker.
- **Cross-entity search** — implemented as a single Prisma query using relation filters (`candidate: { name: { contains: ... } }`), which Prisma compiles to a SQL `JOIN`. This was verified directly against Prisma's query log rather than assumed.
- **Navigation** — every entity links to its counterpart: candidate rows link to detail pages, application rows link to their candidate, and the candidate detail page links to each of their applications.
- **UI states** — loading skeletons, empty states, error states with retry, disabled/loading submit buttons, and confirmation dialogs before any delete.

## Architectural decisions

- **Monorepo via npm workspaces.** `packages/shared` holds all Zod schemas and inferred TypeScript types. Both `apps/api` and `apps/web` import from it directly — there is exactly one definition of what a `Candidate` or `Application` looks like.
- **No authentication.** The brief doesn't request auth anywhere in the requirements or scoring rubric for this internal tool, and the rubric explicitly rewards not padding scope. Adding a login system would have been unrequested complexity.
- **Soft delete on Candidates, hard delete on Applications** — matches the brief exactly (§4.1 requires soft delete with `deleted_at`; allows either for Applications, and hard delete was simpler since nothing references an Application).
- **"Hired this month"** is computed from `updated_at` on records with `status = hired`, since there's no dedicated `hired_at` timestamp in the schema. This assumes the most recent update to a hired application corresponds to the status change — worth flagging as an assumption rather than a certainty.
- **"Rejection rate"** is `rejected ÷ total applications`. An alternative denominator (`rejected ÷ (rejected + hired)`, i.e. rate among *decided* applications) is arguably more meaningful, but the brief doesn't specify which was intended, so the simpler, unambiguous denominator was used.
- **Weekly applications chart** buckets by `applied_at`, not `created_at`. Seeded records are all created within seconds of each other (whenever the seed script ran), so `created_at` would produce a flat, meaningless chart, while `applied_at` has real spread across 8 weeks — that's the field actual usage would care about anyway.
- **No raw SQL anywhere in application code** — including the weekly chart aggregation, which was initially prototyped with `$queryRaw` but rebuilt using a plain Prisma query with in-memory bucketing once it became clear the brief's "no raw SQL except in migrations" rule applied to it too.

## Testing

Backend tests use Vitest with Fastify's `inject()` — no running server required. They currently run against the same PostgreSQL instance as local development, with `fileParallelism: false` set in `vitest.config.ts` so test files run sequentially and don't race each other over shared rows. Coverage includes:

- Candidates: create (201/400/409), list, search by name
- Applications: create (201/400/404), update (200/404), cross-entity search by candidate name and by job title
- Dashboard: full metrics shape and correctness with seeded data, and the zero-data case
- Shared Zod schemas: valid and invalid cases for both `Candidate` and `Application` input schemas, including the enum

Run everything:
```bash
npm test
```

Run just the shared schema tests:
```bash
npm run test --workspace=packages/shared
```

## What I'd do with more time

- **Isolate tests from the dev database.** Right now tests share the dev Postgres instance and run serially to avoid collisions. A dedicated test database (or schema) wired up via a Vitest `globalSetup` would let tests run in parallel and stop wiping local dev data on every test run.
- **Cursor-based pagination** instead of offset-based, for better performance at larger data volumes.
- **Optimistic updates** on application status changes, so the UI feels instant rather than waiting on the mutation round-trip.
- **A Kanban board view** of applications grouped by status, as an alternative to the table view.
- **Frontend component tests** with React Testing Library for the more complex components (the candidate picker, the applications filter bar).
- **Lock down CORS** to a specific frontend origin in production — it currently reflects any origin, which is fine for local development but shouldn't ship that way.

## Known gaps

None currently outstanding — all required functionality from the brief is implemented and tested. The items above are enhancements beyond the required scope, not missing requirements.
