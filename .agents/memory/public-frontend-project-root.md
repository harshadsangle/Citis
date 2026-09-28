---
name: Public frontend project root
description: Startup constraint for the public Next.js app when the workspace contains a duplicate root-level App Router tree.
---

The public Next.js process must use `citis-infotech/frontend` as its working directory, not the repository root with a nested directory argument. The nested app also owns the active shared login, registration, and password-reset forms; the root-level duplicate is stale.

**Why:** This workspace contains duplicate public App Router trees at the repository root and under `citis-infotech/frontend`. Starting Next from the workspace root can make route discovery and `.next` cache ownership ambiguous; a clean startup from the frontend directory reliably registers `/`.

**How to apply:** Keep the Linux/Replit workflow and Windows startup script explicit about the public frontend working directory. Put shared auth-form changes in the nested frontend, then verify `/` plus representative public routes.