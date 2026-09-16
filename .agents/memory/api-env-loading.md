---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

In local development, `services/api/.env.local` is authoritative on Linux/Replit; on Windows, only the repository-root `.env.local` is allowed so Replit-internal database hosts cannot be selected accidentally. Published production processes must never load `.env.local` because platform-provided production values are authoritative.

**Why:** An off-by-one path once broke Windows startup, and loading the Linux development file in Autoscale later replaced the managed production database URL with the unreachable development hostname.

**How to apply:** Skip local files for production or `REPLIT_DEPLOYMENT=1`. Also preserve a supplied Linux database URL when `REPLIT_DEV_DOMAIN` is absent because published child processes may expose neither primary flag. Keep Windows local loading unchanged.