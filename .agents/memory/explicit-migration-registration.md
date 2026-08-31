---
name: Explicit migration registration
description: Database migrations are applied from a hard-coded ordered list rather than discovered automatically.
---

Every new database migration must be added both as a migration file and to the API migration runner's ordered list.

**Why:** The runner executes only the versions named in that list, so a valid SQL file can otherwise remain unapplied without an obvious startup error.

**How to apply:** When adding schema or role-permission changes, update the ordered migration sequence and run the migration command against the intended environment before verifying the feature.