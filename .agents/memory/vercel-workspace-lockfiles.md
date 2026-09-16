---
name: Vercel workspace lockfiles
description: Vercel app-root installs may resolve dependencies through the repository workspace lockfile.
---

When Vercel’s Root Directory points to a workspace app, run repository-level lockfile preparation relative to the script location rather than the current working directory. Do not assume an app-root install ignores the parent workspace lockfile.

**Why:** An institution-admin deployment ran from its app directory but npm still resolved packages from the repository lockfile, including Replit-only registry URLs unavailable on Vercel.

**How to apply:** Make pre-install tools locate the repository root from their own file URL, invoke them with a path valid from the configured Vercel Root Directory, and test the exact install command from that directory.