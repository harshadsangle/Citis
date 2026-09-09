---
name: LMS content access boundary
description: Enrollment and assignment rules that must protect every LMS content path.
---

Learner course access must be enforced both in hierarchy list queries and in the shared direct resource resolver used by lesson, managed-file, and SCORM endpoints. Instructor assignment checks and LMS administrator bypasses remain separate.

**Why:** Checking only direct resource reads leaves list endpoints able to enumerate another course, while checking only lists leaves guessed IDs and file/SCORM routes exposed.

**How to apply:** Keep the course join in every child-list query, filter learner rows through an active enrollment in the same tenant/institution/campus scope, and reuse the direct resolver guard before reading or launching stored resources.