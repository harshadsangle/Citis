---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

On Linux/Replit, `services/api/.env.local` is authoritative; on Windows, only the repository-root `.env.local` is allowed so Replit-internal database hosts cannot be selected accidentally. API entrypoints must resolve both locations from source paths rather than the shell cwd.

**Why:** The API source is nested under `services/api/src/config`, and an off-by-one parent calculation silently looked in `services/.env.local`, causing Windows API startup to fail even when the documented root file was valid.

**How to apply:** Branch on `process.platform`: choose the repository root on Windows and API-local first on Linux/Replit, with local files overriding inherited values before constructing database clients or bootstrapping Nest.