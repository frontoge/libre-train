# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An open-source CRM for personal training. Bun workspace monorepo with four packages:

- `client/` — React 19 + Vite + Ant Design SPA (`@libre-train/client`)
- `server/` — Bun + Express API (`@libre-train/server`)
- `shared/` — Types, route constants, and utilities consumed by both client and server (`@libre-train/shared`)
- `db/` — Prisma schema, migrations, and generated Prisma/Zod clients (`@libre-train/db`)

`database/` (note: not the `db/` workspace) contains raw SQL definitions — `tables/`, `views/`, `procedures/`, and seed `scripts/`. Many API handlers rely on stored procedures defined here, so schema changes often require coordinating Prisma migrations in `db/prisma/migrations` with SQL under `database/`.

## Common commands

Run from the repo root unless noted.

```bash
bun install                  # install all workspaces
bun run db:generate          # generate Prisma + Zod clients into db/generated/ (required before build)
bun run build                # builds shared first, then client + server sequentially
bun run start:client         # vite dev server for the client
bun run start:server         # bun --watch for the server
bun run test                 # vitest watch across workspaces (skips shared)
bun run test:run             # vitest run once
bun run lint                 # eslint across workspaces (skips db)
bun run lint:fix
bun run format               # prettier --write on **/*.{js,ts,tsx,json,css}
bun run format:check         # CI format check
bun run db:deploy            # prisma migrate deploy (production migrations)
```

Per-workspace commands (e.g., run a single test file):

```bash
bun run --filter @libre-train/server test -- test/handlers/cycle-handlers.test.ts
bun run --filter @libre-train/client test -- src/path/to/Foo.test.tsx
bun run --filter @libre-train/db db:migrate           # create a new dev migration
bun run --filter @libre-train/db db:migrate:reset     # reset dev database
```

`build` ordering matters: `shared` must build before the others because its dist is consumed by both client and server. `db:generate` must run at least once after install, and again whenever `db/prisma/schema.prisma` changes — otherwise `@libre-train/db/client` and `@libre-train/db/zod` imports will fail to resolve.

## Required environment

- `db/.env` — `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (checked by `db/prisma.config.ts`; also used by the server via `@prisma/adapter-mariadb`)
- `server/.env` — the DB vars above, plus `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `FRONTEND_URL` (CORS origin). Server exits on startup if the JWT secrets are missing.
- `client/.env` — `VITE_API_URL` (base for fetches; `/api` is appended by `getAppConfiguration`), `VITE_ENV` (`local` | `dev` | `prod`).

Local auth bypass: when `VITE_ENV=local` and `getAppConfiguration().disableAuth` is true, the client pins itself to user id 10 and skips login. `disableAuth` is currently hardcoded to `false` in `client/src/config/app.config.ts` — flip it locally if needed, but never commit that change.

## Architecture

### Request flow

1. Client calls go through `client/src/helpers/fetch-helpers.ts` / `api.ts`, targeting paths from `@libre-train/shared` `Routes`.
2. Express mounts everything under `/api` (`server/index.ts` → `server/api/router.ts`). All endpoints are registered in `router.ts` using the same `Routes` constants, so the client and server agree on paths by construction — when adding an endpoint, add it to `shared/routes.ts` first, then both sides import it.
3. Handlers live in `server/api/handlers/*-handlers.ts`, grouped by domain (auth, client, cycle, diet, assessment, exercise, contact, workout-routine). They use the shared `prisma` instance from `server/database/mysql-database.ts`, which wraps `PrismaClient` with the MariaDB adapter.
4. Many handlers call MySQL stored procedures (see `database/procedures/`) via `prisma.$queryRaw` rather than model methods — check both when tracing behavior.

### Data model

- Canonical schema: `db/prisma/schema.prisma` (MySQL provider, views preview feature enabled). The `database/tables/` and `database/views/` SQL files mirror this and are used for initial setup / reference.
- `db/prisma/zod-generator.config.json` drives `prisma-zod-generator`, outputting Zod schemas to `db/generated/zod`. These are re-exported via `@libre-train/db/zod`.
- `shared/models.ts` wraps each Zod schema with `DataModel<T>` — a transform that stringifies `Date` fields (to match JSON-over-HTTP) and converts `null` to `undefined`. Use `DataModel<typeof FooSchema>` for any type that crosses the API boundary rather than the raw Prisma type.

### Client structure

- `App.tsx` wires Ant Design theming, routing (`react-router-dom` v7), and a top-level `AppContext` that holds `clients`, `exerciseData`, `assessmentTypes`, auth state, and `stateRefreshers`. These are fetched once on auth change and shared via context — prefer extending the context refreshers over ad-hoc fetches when data is app-wide.
- Feature areas each have a `*Router.tsx` under `pages/<area>/` (clients, training, exercises, assessments, diet) plus domain components under `components/<Area>/`.
- `RequireAuth` gates the authenticated shell; `/login`, `/signup`, `/logout`, and `/clients/cycle/:microcycleId` (public cycle viewer) sit outside the shell.

### Training cycle hierarchy

Macrocycle → Mesocycle → Microcycle → WorkoutRoutine → PlannedExerciseGroup → PlannedExercise. Only one cycle at each level can be active per client (`is_active` flag). Many cycle endpoints still key off `clientId` rather than cycle id — see the TODO in `server/api/router.ts`.

## Conventions

- Prettier with tabs (width 4), single quotes, `printWidth: 130`, `experimentalOperatorPosition: "start"`, import sorting via `@ianvs/prettier-plugin-sort-imports`. Run `bun run format` before committing; CI runs `format:check`.
- ESLint max-warnings thresholds are pinned per workspace (client: 21, server: 3). New warnings will fail CI even if they're under the budget of another workspace.
- Tests: `server/test/**/*.test.ts` (node env), `client/src/**/*.test.tsx` (jsdom, setup in `src/test/setup.ts`). Both alias `@libre-train/shared` to `../shared`.
- Server-side dates: import `dayjs` from `server/config/dayjs.ts` (not the package directly) so plugins stay consistent.
