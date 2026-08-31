---
name: Assessment completion integrity
description: Durable rules for how LMS assessment results and assignment completion must be recorded.
---

Assessment completion records must be created only from a server-validated submitted attempt. Learner payloads may contain answers, but never an authoritative score or pass state. Assignment assessments remain on the separate instructor-grading path.

**Why:** A direct completion endpoint that accepted learner-supplied scores could make progress and certification outcomes untrustworthy.

**How to apply:** Keep attempt ownership, publication, enrollment, question completeness, answer-shape validation, server scoring, attempt limits, and idempotent submission checks together in the LMS assessment boundary.