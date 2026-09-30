# Local development

Run the complete application from the repository root:

```bash
npm run dev
```

The root launcher starts:

| Service | Port |
| --- | ---: |
| API | 4000 |
| Institution Admin | 4101 |
| Instructor Portal | 4102 |
| Learner Portal | 4103 |
| Public Frontend | 5000 |

Stopping the root command stops the child services as well. No individual
workspace directory is required.

## Linux / macOS local setup

Install Node.js 24+ and PostgreSQL 16, then from the repository root:

```bash
npm ci
npm ci --prefix citis-infotech/frontend
```

Create a repository-root `.env.local` (it is git-ignored) with at least:

```text
DATABASE_URL=postgres://postgres@127.0.0.1:5432/citis
DEMO_ADMIN_PASSWORD=...
DEMO_INSTRUCTOR_PASSWORD=...
DEMO_LEARNER_PASSWORD=...
```

The API reads `services/api/.env.local` first on Linux, so copy the same file
there too. Then load it into the shell, set up the database and start the stack:

```bash
cp .env.local services/api/.env.local
set -a; . ./.env.local; set +a
npm run db:setup-local
npm run dev
```

### When port 4000 is already in use

The Linux launcher honours `API_PORT` (default `4000`) and passes the matching
`LMS_API_ORIGIN` to every portal and the public site:

```bash
API_PORT=4600 npm run dev
```

## Tests

| Command | What it runs | Needs the stack running |
| --- | --- | --- |
| `npm run test:foundation` | API unit and database tests | No (needs `DATABASE_URL`) |
| `npm run test:learner-auth` | Live learner sign-in regression | Yes |
| `node --import tsx --test apps/portal-middleware.spec.ts` | Portal role guards | No |
| `node --test apps/teacher-portal/tests/greeting.test.mjs` | Teacher portal greeting | No |

`test:learner-auth` targets `http://127.0.0.1:4000/api/v1` by default; set
`LMS_AUTH_REGRESSION_API_ORIGIN` when the API runs on another port.

## Package registry

Lockfiles must reference `https://registry.npmjs.org/`. Replit rewrites them
to its internal package firewall, which is unreachable elsewhere; run
`node scripts/prepare-vercel-install.mjs` before committing lockfile changes
made on Replit.

## Windows local PostgreSQL

The smallest safe Windows setup keeps the existing PostgreSQL LMS/API intact
and runs PostgreSQL locally on the Windows machine. This avoids changing the
schema, authentication, sessions, migrations, or LMS behavior, and does not
require a hosted or paid database.

Install the free PostgreSQL server locally, create a database named
`citis_lms`, and copy the repository template:

```text
C:\Users\Ayush\Citis\citis-infotech\.env.local
```

```powershell
Copy-Item .env.local.example .env.local
```

Set `DATABASE_URL` to the local PostgreSQL instance, for example:

```text
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@127.0.0.1:5432/citis_lms
```

Also set the three local `DEMO_*_PASSWORD` values in `.env.local`. Do not copy
the Replit-internal `helium` value; it is scoped to Replit and is not reachable
from Windows.

On Windows, the API reads only the repository-root `.env.local`. On
Replit/Linux, the existing API-local environment remains authoritative. The
launcher does not create fallback credentials or replace either database
configuration.

After PostgreSQL is running and the local values are set, initialize the schema
and development accounts from the repository root:

```bash
npm run db:setup-local
```

This applies all canonical migrations and idempotently creates or updates the
Admin, Instructor, and Learner demo accounts. It does not print or store the
password values.