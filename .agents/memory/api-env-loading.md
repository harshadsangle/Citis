---
name: API local environment loading
description: How API entrypoints select local database configuration in npm workspace commands.
---

In local development, `services/api/.env.local` is authoritative on Linux/Replit; on Windows, only the repository-root `.env.local` is allowed so Replit-internal database hosts cannot be selected accidentally. Never load `.env.local` in production, staging, Replit deployments, or an invalid environment mode. A supplied Linux database URL may be overridden only on the Replit dev domain or when `CITIS_ENVIRONMENT=development` explicitly opts into local development; Windows local development remains allowed.

**Why:** An off-by-one path once broke Windows startup, and loading the Linux development file in Autoscale later replaced the managed production database URL with the unreachable development hostname.

**How to apply:** Keep the API loader and standalone script policy aligned and test both decision paths. Reject staging, production, invalid modes, `NODE_ENV=production`, and `REPLIT_DEPLOYMENT=1` before considering local overrides. For a supplied database URL, allow an override only with explicit development mode, the Replit dev domain, or Windows local development.