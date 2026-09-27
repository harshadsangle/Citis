---
name: Course institution allocations
description: Separates a course's canonical institution from the institutions where college learners may access it.
---

Treat course allocations as an access and eligibility list, not as course ownership. Keep the course's canonical institution and programme unchanged, and keep enrollment rows in the canonical course scope. For college learners, validate access against the learner profile's institution and that institution's active allocation. Allocations never create enrollment. Preserve the institutionless direct-student path.

Only platform administrators should replace the full tenant-wide allocation set. Institution-scoped administrators must not submit a replacement based on a partial institution list, since doing so could remove allocations outside their scope. A published course may have zero active allocations; that disables college-student access without changing enrollment rows.

**Why:** One course must serve learners at multiple institutions without cloning courses or weakening parent-scope integrity, while direct learners retain their existing access flow.

**How to apply:** When changing course visibility or enrollment checks, use active tenant-scoped allocations alongside the existing active-enrollment requirement. Keep full-list replacement platform-only; if institution-scoped editing is added later, use scoped per-institution operations. Do not infer enrollment or rewrite canonical scope from an allocation.