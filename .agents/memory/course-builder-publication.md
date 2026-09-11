---
name: Course Builder publication
description: Defines the required status and Admin handoff after final Course Builder creation.
---

Final Course Builder submission must create the course with the existing `PUBLISHED` course status inside the atomic transaction. After the five-second success state, Admin must return to the Published Courses view and refresh through the existing Courses API.

**Why:** The database defaults a course to `DRAFT`, which excludes a successfully built course from the Published Courses list and makes creation appear unsuccessful.

**How to apply:** Override the course status only in final builder creation; do not expose Draft or Archive choices, modify existing records, or bypass the normal status behavior of nested content.