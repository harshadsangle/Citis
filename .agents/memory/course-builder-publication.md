---
name: Course approval workflow
description: Defines the required Admin-to-Instructor review lifecycle for Course Builder courses.
---

Final Course Builder submission must create the complete hierarchy atomically in an instructor-pending state. A scoped LMS administrator may publish a pending course without instructor assignment. Instructors may publish only explicitly assigned courses; rejection requires a reason and returns the course to Admin. Learner APIs expose only published, enrolled courses.

**Why:** Institution administrators are authorized final approvers, while instructor publication remains limited to courses they were assigned to review. Rejected work needs clear feedback and a safe route back through Admin.

**How to apply:** Keep builder creation atomic and provider-scoped, enforce administrator institution scope, require explicit instructor assignment for instructor publication, require rejection text, and keep learner APIs limited to published courses with active enrollment.