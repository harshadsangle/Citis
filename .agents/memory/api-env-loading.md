---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

API entrypoints must resolve `.env.local` using npm's `INIT_CWD` as well as the process working directory and source location, because workspace scripts run with a package-local `PWD` while the local file commonly lives at the repository root.

**Why:** A direct dotenv test from the repository root can use the intended local database while a workspace migration inherits a different or incomplete `DATABASE_URL`, producing misleading PostgreSQL authentication errors.

**How to apply:** Load `.env.local` before constructing database clients or bootstrapping Nest; in local development let the explicit file override inherited values, while keeping platform values as the fallback when no local file exists.