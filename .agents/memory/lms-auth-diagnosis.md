---
name: LMS authentication diagnosis
description: How to distinguish a failed login from a post-login portal handoff or dashboard request.
---

Validate learner authentication as one chain: login response and Set-Cookie, session resolution through auth/me, role-gated portal entry, and each initial progress-dashboard request. A successful session insert alone does not prove the learner UI completed sign-in.

**Why:** The learner form performs a second auth/me request and the portal performs additional authenticated requests after login, so a generic client status error can be reported after password validation and session creation already succeeded.

**How to apply:** When investigating a learner sign-in error, test the same-origin API proxy and the learner portal with the exact session cookie before changing password, session, or database logic.

Demo credentials can drift even when the learner row looks active and has a bcrypt hash; use the existing idempotent learner seed to repair only that account, then repeat the public-site proxy flow.

**Why:** A valid-looking database row does not prove its stored hash matches the documented development password, while the seed preserves account uniqueness and role boundaries.

**How to apply:** After confirming the public `/api/v1/auth/login` proxy reaches the API, run the demo learner seed before changing authentication code; verify login, `auth/me`, role access, initial progress, and logout.

The demo learner password is an environment secret consumed by the seed and regression test; never restore a password literal in either file.

**Why:** A browser can correctly reach the API and still fail when the documented credential differs from a stale seed literal, while password literals also create avoidable credential exposure.

**How to apply:** Configure `DEMO_LEARNER_PASSWORD` through workspace secrets before seeding or running the learner auth regression; keep authentication itself server-authoritative.