# Local development

This guide walks through running libre-train on your machine for development. It
assumes you are starting from a fresh clone.

## Prerequisites

- **[Bun](https://bun.sh/)** — the package manager and runtime for every workspace.
- **Docker** (with Compose) — used to run the local MariaDB database and the
  [Garage](https://garagehq.deuxfleurs.fr/) object store via `docker-compose.local.yaml`.
  (You can point at your own MariaDB/MySQL instead — see step 3 — but Docker is the
  fastest path.)

> **Two compose files, different jobs:** `docker-compose.yaml` *builds and runs the
> server image* for deployments. `docker-compose.local.yaml` runs **only the backing
> services** (DB + Garage) so you can run the server and client on your host against
> them. This guide uses the latter.

## 1. Install dependencies

From the repo root:

```bash
bun install
```

## 2. Start the local services

Bring up MariaDB and Garage:

```bash
docker compose -f docker-compose.local.yaml up -d
```

This starts:

- **MariaDB** on `127.0.0.1:3306` with database/user/password all `libre_train` (root
  password `root`). Data persists in the `db_data` volume.
- **Garage** (S3-compatible) on `127.0.0.1:3900`, for branding logo storage.

## 3. Configure environment variables

Each workspace reads its config from a `.env` file. Rather than maintaining those by
hand, the repo uses **named env profiles** and a switcher so you can flip the whole stack
between, say, the local containers and a remote database with one command:

```bash
bun run env:use containers
```

This points `db/.env`, `server/.env`, and `client/.env` at the matching
`.env.containers` profile (via symlinks). The **`containers`** profile ships pre-filled
to match the services from step 2 — local DB credentials, `GARAGE_ENDPOINT`, dev-only
auth secrets, and the client's API URL — so there's nothing else to edit to get running.

> The first time you run it, any existing real `<ws>/.env` is preserved as
> `<ws>/.env.saved` (never deleted) so you can switch back to it.

The variables each workspace needs (see the `.env.example` files for the full template):

- **`db/.env`** — `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **`server/.env`** — the same `DB_*` values, plus `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
  (the server **exits on startup** if either is missing — generate real ones with
  `openssl rand -hex 32`), `FRONTEND_URL` (CORS origin, e.g. `http://localhost:5173`), and
  optional `GARAGE_*` values (blank = logo storage disabled).
- **`client/.env`** — `VITE_API_URL` (`http://localhost:3000`), `VITE_ENV` (`local`),
  `VITE_BASE_URL` (`/`).

### Switching env profiles

To target a different environment (e.g. a shared/remote database), create a new profile
in each workspace and switch to it:

```bash
# create the profile files once (any name except local/development/production/test,
# which Bun and Vite treat specially)
cp db/.env.containers db/.env.remote          # then edit db/.env.remote ...
cp server/.env.containers server/.env.remote  # ... and server/.env.remote ...
cp client/.env.containers client/.env.remote  # ... and client/.env.remote

bun run env:use remote      # activate it
bun run env:use containers  # ...and back to local whenever you like
```

All `.env*` files except the `.env.example` templates are git-ignored, so profiles stay
local to your machine.

## 4. Set up the database

Generate the Prisma + Zod clients (required before building or running the server, and
again any time `db/prisma/schema.prisma` changes), then apply the migrations against the
database your active profile points at:

```bash
bun run db:generate

bun run --filter @libre-train/db db:migrate        # dev: create/apply migrations
# or, to apply existing migrations without creating new ones:
bun run db:deploy
```

Prisma migrations are the single source of truth — they create all tables and views and
seed the reference data (assessment types, exercise form/movement-pattern lookups, etc.).
All data access goes through the Prisma client, so there are no stored procedures or extra
SQL to load by hand.

To reset the dev database from scratch later, use
`bun run --filter @libre-train/db db:migrate:reset`.

## 5. Enable logo storage (optional)

Branding logo upload/serving is backed by the Garage container from step 2. If you skip
this, the app still boots but `GET`/`POST` on the branding logo route returns `503`. To
enable it, do the one-time Garage bootstrap:

```bash
C="docker compose -f docker-compose.local.yaml exec garage /garage"
$C status                                                    # copy the node ID
$C layout assign -z dc1 -c 1G <node-id>
$C layout apply --version 1
$C bucket create libre-train-logos
$C key create libre-train-app                                # copy Key ID + Secret
$C bucket allow --read --write libre-train-logos --key libre-train-app
```

Put the printed **Key ID** and **Secret** into `GARAGE_ACCESS_KEY` / `GARAGE_SECRET_KEY`
in your active `server/.env` profile (e.g. `server/.env.containers`) and restart the
server. The S3 endpoint (`http://127.0.0.1:3900`) is already set in the profile.

## 5. Run the app

In two terminals from the repo root:

```bash
bun run start:server     # Bun API with --watch, on http://localhost:3000
```

```bash
bun run start:client     # Vite dev server, on http://localhost:5173
```

Open the client URL in your browser. API calls are sent to `VITE_API_URL` and proxied
to the server under `/api`.

> **Local auth bypass:** when `VITE_ENV=local`, you can skip the login screen by flipping
> `disableAuth` to `true` in `client/src/config/app.config.ts` (it pins you to user id
> `10`). Handy for local work — just never commit that change.

## Useful commands

```bash
bun run build            # build shared, then client + server
bun run test:run         # run the test suites once
bun run lint             # eslint across workspaces
bun run format           # prettier --write
```

See [CLAUDE.md](./CLAUDE.md) for a deeper tour of the architecture, request flow, and
data model.
