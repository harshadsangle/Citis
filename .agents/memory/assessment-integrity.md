---
name: Assessment completion integrity
description: Durable rules for how LMS assessment results and assignment completion must be recorded.
---

Assessment completion records must be created only from a server-validated submitted attempt. Learner payloads may contain answers, but never an authoritative score or pass state. Project, viva, and practical attempts remain pending until scoped instructor grading; assignment assessments remain on the separate central-admin review path, with a 50% pass threshold.

**Why:** A direct completion endpoint that accepted learner-supplied scores could make progress and certification outcomes untrustworthy.

**How to apply:** Keep attempt ownership, publication, enrollment, question completeness, answer-shape validation, server scoring or authorized manual grading, attempt limits, and idempotent submission/grading checks together in the LMS assessment boundary. Count only passed completion records toward course progress.