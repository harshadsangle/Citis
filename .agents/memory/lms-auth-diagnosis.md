---
name: LMS authentication diagnosis
description: How to distinguish a failed login from a post-login portal handoff or dashboard request.
---

Validate learner authentication as one chain: login response and Set-Cookie, session resolution through auth/me, role-gated portal entry, and each initial progress-dashboard request. A successful session insert alone does not prove the learner UI completed sign-in.

**Why:** The learner form performs a second auth/me request and the portal performs additional authenticated requests after login, so a generic client status error can be reported after password validation and session creation already succeeded.

**How to apply:** When investigating a learner sign-in error, test the same-origin API proxy and the learner portal with the exact session cookie before changing password, session, or database logic.