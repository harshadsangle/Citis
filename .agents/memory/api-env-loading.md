---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

In local development, `services/api/.env.local` is authoritative on Linux/Replit; on Windows, only the repository-root `.env.local` is allowed so Replit-internal database hosts cannot be selected accidentally. Published production processes must never load `.env.local` because platform-provided production values are authoritative.

**Why:** An off-by-one path once broke Windows startup, and loading the Linux development file in Autoscale later replaced the managed production database URL with the unreachable development hostname.

**How to apply:** Skip local-file loading when `NODE_ENV=production` or Replit sets `REPLIT_DEPLOYMENT=1`; Autoscale does not necessarily set `NODE_ENV`. Otherwise choose the root on Windows and API-local first on Linux/Replit.