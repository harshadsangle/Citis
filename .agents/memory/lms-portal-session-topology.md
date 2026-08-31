---
name: LMS portal session topology
description: Cookie and redirect constraints for the public site and separate LMS role portals.
---

Keep the public login site and administrator, instructor, and learner portals on the same cookie host unless authentication is deliberately redesigned for cross-host session transfer. Treat configured portal origins as canonical and allowlist any request-header-derived development hosts.

**Why:** The HTTP-only session cookie is host-scoped and shared across ports, not unrelated hostnames. Proxy-internal request URLs can also contain `0.0.0.0`, while blindly trusting forwarded host headers can create unsafe redirects.

**How to apply:** When changing LMS deployment topology or redirect helpers, verify same-host cookie delivery, canonical production origins, hostile forwarded-host handling, and local/Replit proxy behavior.