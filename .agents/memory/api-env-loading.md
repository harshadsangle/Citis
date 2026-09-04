---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

The API package's `services/api/.env.local` is the authoritative local database configuration. API entrypoints must consider it before repository-level `.env.local` files and inherited values, while also resolving workspace paths through npm's `INIT_CWD`.

**Why:** A direct dotenv test can use the API-local database while a workspace migration or Nest process inherits a different or incomplete `DATABASE_URL`, producing misleading PostgreSQL authentication errors.

**How to apply:** Load the API-local `.env.local` before constructing database clients or bootstrapping Nest; in local development let it override inherited values, with broader local/platform values only as fallback when the API-local file is absent.