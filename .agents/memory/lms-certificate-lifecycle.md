---
name: LMS certificate lifecycle
description: Rules for issuing and exposing learning certificates safely.
---

Certificates are issued only from server-validated completion events, require all published course requirements to pass, and are idempotent per enrollment. Public verification exposes credential facts only, never tenant, enrollment, answer, or submission data.

**Why:** Credentials must not be granted from caller-supplied progress or leak private LMS records through a public lookup.

**How to apply:** Keep eligibility checks and uniqueness constraints tenant-scoped; route all new completion paths through the same issuance service and keep public responses on an explicit allowlist.