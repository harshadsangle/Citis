# Staging environment

Staging is opt-in through `CITIS_ENVIRONMENT=staging`. It uses explicit staging database, API, CORS, session, cookie, and demo-account settings. It does not fall back to `DATABASE_URL`, `LMS_API_ORIGIN`, `WEB_ORIGIN`, `SESSION_SECRET`, or the production demo passwords for those resources. If staging-only variables are present under another mode, startup fails rather than ignoring them. Scope all staging-only variables to the staging runtime and Preview frontend environment; production must not receive them.

## Configure a separate environment

1. Provision a staging PostgreSQL database. Do not reuse the production database.
2. Configure the staging API runtime manually with the staging-only variables described below. Store `STAGING_DATABASE_URL` and `STAGING_SESSION_SECRET` only in the staging runtime's secret settings; this repository does not include a staging environment file.
3. Set `PRODUCTION_DATABASE_TARGET` to a credential-free PostgreSQL URL containing only the production host, port, and database name. The API compares this fingerprint to the staging database target at startup and refuses a match.
4. Set `STAGING_WEB_ORIGIN` to the exact HTTPS origin(s) of the staging portals. Set `PRODUCTION_WEB_ORIGIN` to the current production portal origin(s) for comparison. The API rejects any overlap.
5. Configure the portals' Vercel Preview environment with `CITIS_ENVIRONMENT=staging`, `STAGING_API_ORIGIN`, and `PRODUCTION_API_ORIGIN`. Keep these variables scoped to Preview, and use HTTPS API base URLs ending in `/api/v1`. Preview builds fail rather than use `LMS_API_ORIGIN` when the staging API URL is missing or matches production.
6. Build and start the API with `npm run build:api` and `npm run start:staging --workspace @citis/api`. The staging launcher sets `NODE_ENV=production` and `CITIS_ENVIRONMENT=staging`; runtime validation must pass before the API listens.

The staging session cookie is named `citis_staging_session`, is `Secure` and `HttpOnly`, and has no parent-domain attribute. Production continues to use `citis_session` scoped to `.citisinfotech.in`.

## Initialize staging data

With the staging environment variables set in the command environment, run `npm run db:migrate --workspace @citis/api`. Migrations and repository import scripts use `STAGING_DATABASE_URL` in staging and compare its target with `PRODUCTION_DATABASE_TARGET`.

Demo seed commands are disabled in production. To seed staging demo accounts, provide distinct `STAGING_DEMO_ADMIN_PASSWORD`, `STAGING_DEMO_INSTRUCTOR_PASSWORD`, and/or `STAGING_DEMO_LEARNER_PASSWORD` values before running the corresponding root `db:seed-demo-*` command. They are never taken from the production demo password variables.

Database integration tests use only the explicit `CITIS_DB_TEST_URL`; they skip when it is absent and are disabled in production. In staging mode, the test target is also checked against `PRODUCTION_DATABASE_TARGET` and `DATABASE_URL`.

Do not run `scripts/replit-data-only-to-supabase.sh` in staging; the script now refuses that mode. No staging platform settings, production settings, or database contents were changed as part of this repository work.
