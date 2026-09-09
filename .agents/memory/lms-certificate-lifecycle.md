---
name: LMS certificate lifecycle
description: Rules for issuing and exposing learning certificates safely.
---

Certificates are created as review candidates only after server-validated completion of all published course requirements. Only the exact `CITIS_ADMIN` role can approve, reject, issue, or revoke; issuance is idempotent per enrollment. Direct-student candidates may have no institution. Public verification exposes credential facts only, never tenant, enrollment, answer, or submission data.

**Why:** Credentials must not be granted from caller-supplied progress or leak private LMS records through a public lookup. Approval also needs a durable human review boundary before issuance.

**How to apply:** Keep eligibility checks, lifecycle transitions, and uniqueness constraints tenant-scoped; persist reviewer, notes, timestamps, and revocation data; keep public responses on an explicit allowlist.