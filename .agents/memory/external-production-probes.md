---
name: External production probes
description: Safe ways to inspect public custom domains when workspace web-preview tools fail.
---

Replit's external screenshot and web-fetch tools may return 402/429 for a public custom domain even when sanitized shell `curl` can retrieve its HTML and JavaScript.

**Why:** A blocked preview fetch does not establish that the public site itself is unavailable.

**How to apply:** If those tools fail, use credential-free `curl` requests to inspect public response status, redirects, and served assets. Never include login data or cookie values.