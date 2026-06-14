# libre-train

An open-source CRM for personal trainers. libre-train helps trainers manage their
clients end to end — building periodized training programs, tracking nutrition and
body measurements, recording assessments, and keeping client contact details and
documents in one place.

[![Deploy](https://github.com/frontoge/libre-train/actions/workflows/dev-deploy.yaml/badge.svg)](https://github.com/frontoge/libre-train/actions/workflows/dev-deploy.yaml)

## Features

- **Training programs** — periodized macro / meso / microcycles down to individual
  planned exercises, with a public read-only cycle viewer to share with clients.
- **Nutrition tracking** — diet plans plus daily calorie and macro logging.
- **Body metrics & assessments** — weight, measurements, and configurable assessment
  types grouped by posture, composition, and performance.
- **Exercise library** — exercises tagged by movement pattern and form.
- **Client management** — contact directory, client dashboards, forms, and documents.
- **Branding** — custom names, colors, and logos so a trainer can make the app their own.

## Tech stack

- **Client** — React 19 + Vite + Ant Design SPA (`react-router-dom` v7).
- **Server** — Bun + Express REST API.
- **Database** — MariaDB/MySQL accessed through Prisma (with the MariaDB adapter) and
  a set of stored procedures and views.
- **Object storage** — [Garage](https://garagehq.deuxfleurs.fr/), an S3-compatible
  store used for branding logos.

## Project structure

This is a [Bun](https://bun.sh/) workspace monorepo:

| Path        | Package                | Purpose                                                              |
| ----------- | ---------------------- | ------------------------------------------------------------------- |
| `client/`   | `@libre-train/client`  | React + Vite single-page app.                                       |
| `server/`   | `@libre-train/server`  | Bun + Express API mounted under `/api`.                             |
| `shared/`   | `@libre-train/shared`  | Types, route constants, and data contracts shared by both sides.    |
| `db/`       | `@libre-train/db`      | Prisma schema, migrations, and the generated Prisma + Zod clients.  |

## Getting started

See **[LOCAL-DEV.md](./LOCAL-DEV.md)** for full instructions on setting up and running
the project locally (prerequisites, environment variables, database setup, and starting
the client and server).

The short version:

```bash
bun install
# copy each .env.example to .env and fill in the values (see LOCAL-DEV.md)
bun run db:generate
bun run start:server   # in one terminal
bun run start:client   # in another
```

## License

See [LICENSE](./LICENSE).
