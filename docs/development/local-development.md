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