---
name: Instructor course visibility
description: Distinguishes instructor catalogue access from course-level teaching authority.
---

Published courses may be visible to an instructor through an active instructor-college relationship, but roster, assignment, progress, editing, and approval actions require an active explicit course assignment.

**Why:** Treating every catalogue-visible course as assigned caused the Instructor Portal to call protected teaching endpoints for unassigned courses, including a misleading learner-auth failure.

**How to apply:** Keep broad published-course visibility separate from explicit assignment state. Teaching workspaces and course-management requests must use only explicitly assigned courses; pending and rejected review courses remain explicit-assignment-only.