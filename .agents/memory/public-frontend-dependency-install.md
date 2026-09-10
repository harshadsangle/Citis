---
name: Public frontend dependency install
description: The public Next frontend has a separate package installation and lockfile from the root workspaces.
---

The public frontend must keep its own package.json, package-lock.json, and installed Next/SWC packages aligned with the root-compatible versions. A package-manager refresh can fail on the optional Tailwind WASI artifact through the Replit package firewall even when the requested versions are valid.

**Why:** A stale nested install can make the public build use a different Next/SWC patch than its lockfile and produce runtime warnings or non-reproducible builds.

**How to apply:** When updating shared frontend dependencies, update and verify the public frontend lockfile separately, then run its production build and confirm Next and the matching SWC package report the same version.