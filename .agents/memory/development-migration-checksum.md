---
name: Development migration checksum
description: The development database has a historical migration checksum mismatch that blocks the normal migration runner.
---

The development database’s stored checksum for migration 026 does not match the current repository file. Do not update the stored checksum automatically or edit the historical migration merely to make the runner pass.

**Why:** The mismatch predates later migrations and may represent a previously applied version of the tenant-integrity migration. Rewriting the checksum would hide that provenance issue.

**How to apply:** When a new migration must be tested before the mismatch is reconciled, apply only that new migration transactionally and register its own version/checksum. Treat reconciliation of migration 026 as separate work requiring an explicit schema comparison.