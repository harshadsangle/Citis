---
name: Course approval workflow
description: Defines Admin-only course lifecycle decisions and assigned-instructor content review.
---

Final Course Builder submission creates the complete hierarchy atomically in an instructor-pending state. LMS administrators own course creation, course-level edits, publication, rejection, and archival. Instructors cannot create courses or change course-level settings or lifecycle state, even when explicitly assigned. Assigned instructors retain access to course-content review and editing. Rejection requires a reason, and learner APIs expose only published, enrolled courses.

**Why:** Course-level decisions must have one accountable administrative owner; instructor assignment grants course-content responsibilities, not authority over course records or final publication.

**How to apply:** Keep builder creation atomic and provider-scoped. Apply the LMS administrator role boundary to course creation, edits, publish/reject, and archive; enforce administrator institution scope; preserve explicit assignment checks for instructor content work; require rejection text; and keep learner APIs limited to published courses with active enrollment.