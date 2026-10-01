---
name: Course institution allocations
description: Separates a course's canonical institution from the institutions where college learners may access it.
---

Treat course allocations as an access and eligibility list, not as course ownership. Keep the course's canonical institution and programme unchanged, and keep enrollment rows in the canonical course scope. When a course is published or its allocations are replaced, automatically enroll eligible active college learners recorded as successful CSV imports for active allocated institutions. Keep this idempotent and separate from institutionless direct-student enrollment and purchases.

Only platform administrators should replace the full tenant-wide allocation set. Institution-scoped administrators must not submit a replacement based on a partial institution list, since doing so could remove allocations outside their scope. A published course may have zero active allocations; that disables college-student access without changing enrollment rows.

**Why:** One course must serve learners at multiple institutions without cloning courses or weakening parent-scope integrity. Imported college learners should be enrolled as part of allocation, while direct learners retain their separate access and purchase flow.

**How to apply:** For automatic enrollment, require a successful imported/updated CSV row, active user, active college-student profile and role, matching institution linkage, and an active tenant-scoped allocation; use the existing enrollment validation and row shape, and skip existing active enrollments. Keep full-list replacement platform-only; if institution-scoped editing is added later, use scoped per-institution operations. Allocation removal must not rewrite canonical course scope or affect direct-student enrollment and purchases.