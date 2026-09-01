---
name: Next dev/build collision
description: Running a Next production build while the managed multi-app dev workflow is active can corrupt shared .next development manifests.
---

Do not run a Next production build concurrently with the managed development workflow when both use the same app `.next` directory. Stop the workflow, clear generated state, and restart the normal workflow before preview verification.

**Why:** Concurrent writers caused intermittent missing `.next/static/development/_buildManifest.js.tmp.*` errors and transient 500 responses from the public login page.

**How to apply:** Treat `.next` manifest ENOENT errors as build-process contention first; inspect and stop orphaned dev/build processes before changing application code.