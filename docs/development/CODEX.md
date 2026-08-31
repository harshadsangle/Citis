# CITIS platform coding rules

This file mirrors the shared implementation contract for coding agents:

1. Read the current architecture and relevant module docs before editing.
2. Prefer small, reviewable changes with explicit migrations and tests.
3. Do not silently reuse the root legacy LMS tree.
4. Do not place secrets, provider credentials, or raw session tokens in source,
   tests, logs, or browser storage.
5. Preserve the public CITIS app and its existing design unless a task
   explicitly changes a destination or feature.
6. Verify API builds, migration integrity, tenant isolation, RBAC, audit
   behavior, and the public frontend after changes.