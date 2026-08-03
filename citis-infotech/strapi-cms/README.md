# CITIS Strapi CMS

This directory is a lightweight, source-controlled Strapi 5 scaffold. It includes configuration,
core content-type schemas, and both SQLite and PostgreSQL database options without running the
interactive generator.

## Install this scaffold

Requires Node.js 20 or newer.

```bash
cp .env.example .env
npm install
npm run develop
```

Open <http://localhost:1337/admin> and create the first administrator. The first run creates the
local SQLite file at `.tmp/data.db`; that file and uploaded media are intentionally ignored by
Git.

Generate real secrets before any shared deployment. A convenient command is:

```bash
openssl rand -base64 48
```

Run it independently for each JWT secret, salt, encryption key, and each value in `APP_KEYS`.

## Alternative: generate a clean Strapi app

To compare this scaffold with a freshly generated app, run the generator in a **new empty
directory**:

```bash
mkdir ../strapi-generated
cd ../strapi-generated
npx create-strapi-app@latest . --quickstart
```

Do not run that command directly in this non-empty directory: it can conflict with the checked-in
configuration and schemas. Copy only reviewed generator changes back into this scaffold.

## Database

SQLite is the zero-configuration local default:

```dotenv
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

PostgreSQL is recommended for staging and production:

```dotenv
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=citis_strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=replace-me
DATABASE_SSL=false
DATABASE_SCHEMA=public
```

`DATABASE_URL` can be set when the hosting provider supplies a connection string. Enable TLS and
configure certificate validation according to the provider's guidance.

## Content and permissions

The initial schemas create:

- Blog
- Case Study
- Testimonial
- Client Logo (API name: `client`)
- Career
- Product
- Academy Course

See [`../docs/strapi-content-types.md`](../docs/strapi-content-types.md) for field contracts and
planned Homepage/About structures.

Strapi collection endpoints are private by default. In **Settings → Users & Permissions plugin →
Roles → Public**, grant only `find` and `findOne` for content intended for anonymous visitors.
Alternatively, create a read-only API token for server-side frontend requests.

Never expose a privileged token through a `NEXT_PUBLIC_*` variable. The frontend's server-side
fetch helper supports `STRAPI_API_TOKEN`; set it only in the frontend server environment.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run develop` | Start Strapi with admin hot reload |
| `npm run build` | Build the production admin application |
| `npm start` | Start the production server |
| `npm run strapi -- <command>` | Run another Strapi CLI command |

For containerized startup, use `docker compose -f ../docker/docker-compose.yml up --build`.

## Production notes

- Use PostgreSQL and an external upload provider rather than local SQLite/uploads.
- Persist and back up the database and media independently.
- Set `PUBLIC_URL` to the external HTTPS CMS origin.
- Restrict `/admin`, review role permissions, and rotate API tokens.
- Build after changing admin-facing environment values.
- Back up the database before upgrading Strapi and test upgrades in staging.
