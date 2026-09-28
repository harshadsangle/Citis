---
name: SCORM sandbox and authenticated assets
description: Browser credential behavior when CSP sandbox is applied to LMS-hosted SCORM packages.
---

Do not apply response-level CSP `sandbox` without `allow-same-origin` to SCORM documents served from cookie-authenticated asset routes until package subresource delivery is verified. In Chromium, the launch document navigation received the session cookie, but scripts requested by the sandboxed document did not; protected asset endpoints therefore reject them.

**Why:** The sandbox gives the document an opaque origin. Relative package asset requests are no longer same-origin credentialed requests, even though their URLs point back to the portal/API route.

**How to apply:** Before adopting this handbook mitigation, test a multi-file SCORM package in a browser and decide how authenticated subresources will load without granting `allow-same-origin`. Do not treat a unit test of the launch HTML response as proof that package assets still work.