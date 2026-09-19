---
name: Scoped admin capability routes
description: How institution-scoped administrators access instructor-management data without weakening platform permission boundaries.
---

Institution-scoped administrators should use narrowly scoped LMS-capability routes for instructor-management option data and user operations, while service queries enforce the actor’s institution and campus scopes.

**Why:** The global permission guard intentionally rejects platform-prefixed identity and organization permissions for institution administrators, even when those permissions appear in stored role data. Reusing those routes makes a valid Admin UI fail with 403 responses.

**How to apply:** Prefer capability-specific endpoints that return only instructor roles or scoped institution/campus options. Keep platform-wide RBAC and organization routes unchanged, and ensure user list, lookup, and role assignment queries use `isPlatformUser` rather than broad LMS-administrator checks for bypass decisions.