---
name: API development readiness
description: Startup behavior for the multi-service local development launcher.
---

The API dev process must use `ts-node --transpile-only` in both platform-specific launcher paths. Full `ts-node` type-checking can delay the Nest listener long enough for the Windows readiness probe to report `fetch failed`, even when the database and environment are valid.

**Why:** The API uses the project TypeScript configuration with decorator metadata; transpile-only preserves that runtime behavior while avoiding an unnecessary startup type-check in a development process. Production builds and API type checks remain separate validation steps.

**How to apply:** Keep the API readiness URL and the existing service orchestration unchanged. If startup fails again, verify the resolved local environment path, database migrations, and API child logs before changing the readiness timeout.