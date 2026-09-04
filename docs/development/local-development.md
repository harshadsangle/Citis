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

## Windows database requirement

Windows local development must use a PostgreSQL connection that is reachable
from Windows. Put the connection string in the repository-root `.env.local`:

```text
C:\Users\Ayush\Citis\citis-infotech\.env.local
```

Do not copy a Replit-internal database host such as `helium`. Replit's
development PostgreSQL is scoped to the Replit environment and is not a
Windows-local database endpoint. Use either an externally reachable PostgreSQL
connection provided for local development or a local PostgreSQL instance that
has the project schema and required development data.

On Windows, the API reads only the repository-root `.env.local`. On
Replit/Linux, the existing API-local environment remains authoritative. The
launcher does not create fallback credentials or replace either database
configuration.

After setting `DATABASE_URL` and the three demo password environment variables
through your local secure environment, initialize a new Windows development
database from the repository root:

```bash
npm run db:setup-local
```

This applies all canonical migrations and idempotently creates or updates the
Admin, Instructor, and Learner demo accounts. It does not print or store the
password values.