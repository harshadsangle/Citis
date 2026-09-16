---
name: Next public environment lookup
description: How production portal URLs must be accessed in the public Next.js app.
---

Reference every `NEXT_PUBLIC_*` variable through a static property expression rather than a computed `process.env[key]` lookup.

**Why:** Next.js replaces statically referenced public variables at build time. A Vercel project had the correct portal URL configured, but a computed lookup remained undefined and caused the production LMS redirect page to throw.

**How to apply:** Use explicit branches or a literal map whose values are direct `process.env.NEXT_PUBLIC_NAME` expressions. Do not dynamically construct or index public environment-variable names.