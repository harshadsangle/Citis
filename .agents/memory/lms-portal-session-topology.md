---
name: LMS portal session topology
description: Cookie and redirect constraints for the public site and separate LMS role portals.
---

Keep the public login site and administrator, instructor, and learner portals on the same cookie host unless authentication is deliberately redesigned for cross-host session transfer. Treat configured portal origins as canonical and allowlist any request-header-derived development hosts.

**Why:** The HTTP-only session cookie is host-scoped and shared across ports, not unrelated hostnames. Proxy-internal request URLs can also contain `0.0.0.0`, while blindly trusting forwarded host headers can create unsafe redirects.

**How to apply:** When changing LMS deployment topology or redirect helpers, verify same-host cookie delivery, canonical production origins, hostile forwarded-host handling, and local/Replit proxy behavior. If a portal moves from a same-origin proxy to the API host, add the portal origin to the API CORS allowlist and republish the API before testing browser requests.

On Replit preview, a development request can arrive with a loopback host that must not be used as a browser redirect target. When `REPLIT_DEV_DOMAIN` is available, use that public hostname and the portal's exposed external port; retain the hostname so the session cookie remains shared across ports.

**Why:** A browser interprets `127.0.0.1` as the viewer's own device, while cookies are host-scoped even though they work across ports.

**How to apply:** For Replit development redirects, map loopback request hosts to the same public dev hostname plus the role portal's external port. Keep local-port redirects when running outside Replit.