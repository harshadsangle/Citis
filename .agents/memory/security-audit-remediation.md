---
name: Security audit remediation
description: Dependency and path-handling safeguards established during production-readiness audits.
---

The project contains separate dependency trees for the root LMS, the standalone public frontend, and the Strapi CMS. Security scans must cover each lockfile; upgrading only the root workspace can leave the public app or CMS vulnerable.

**Why:** The audit initially reported vulnerable versions that were no longer present in the root tree after an upgrade, but remained in the nested frontend lockfile.

**How to apply:** Prefer targeted direct upgrades and package-manager overrides for compatible transitive fixes, then rescan every lockfile and rebuild each affected app.

Managed importer files must validate storage keys segment-by-segment, resolve only below the configured storage root, verify canonical existing paths and parent directories against that root, and use explicit scanner suppressions only where the invariant is enforced in code.

**Why:** Static analysis cannot infer the full containment invariant from the helper, while the actual importer inputs include database-derived identifiers and fixed filenames.

**How to apply:** Keep all managed-file reads, writes, and cleanup behind the shared containment helper; add traversal tests for parent traversal, absolute paths, separators, and safe nested keys.