---
name: Course approval workflow
description: Defines the required Admin-to-Instructor review lifecycle for Course Builder courses.
---

Final Course Builder submission must create the complete hierarchy atomically in an instructor-pending state. Admin assigns an instructor; only that explicitly assigned instructor can publish or reject with a reason. Rejection returns the course to Admin, while instructor publication is the only transition that exposes it to learners.

**Why:** Admin creation is content preparation, not final approval. Learners must never receive a course until an assigned instructor has reviewed it, while rejected work needs clear feedback and a safe route back through Admin.

**How to apply:** Keep builder creation atomic and provider-scoped, allow instructor assignment before publication, require an explicit course assignment for review actions, require rejection text, and keep learner APIs limited to published courses.