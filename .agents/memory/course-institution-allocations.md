---
name: Course institution allocations
description: Separates a course's canonical institution from the institutions where college learners may access it.
---

Treat course allocations as an access and eligibility list, not as course ownership. Keep the course's canonical institution and programme unchanged, and keep enrollment rows in the canonical course scope. For college learners, validate access against the learner profile's institution and that institution's active allocation. Allocations never create enrollment. Preserve the institutionless direct-student path.

**Why:** One course must serve learners at multiple institutions without cloning courses or weakening parent-scope integrity, while direct learners retain their existing access flow.

**How to apply:** When changing course visibility or enrollment checks, use active tenant-scoped allocations alongside the existing active-enrollment requirement. Do not infer enrollment or rewrite canonical scope from an allocation.