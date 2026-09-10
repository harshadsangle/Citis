---
name: Video completion authority
description: Durable rule for learner video progress, lesson completion, and certificate eligibility.
---

Only server-stored resource progress can mark a video complete. Browser storage may restore ranges and resume position for playback, but must never set the completion bit or authorize lesson, course, or certificate outcomes.

**Why:** Local browser state and client completion flags can be forged, while lesson completion and certificate issuance rely on server-side progress records.

**How to apply:** Derive completion from validated server progress and canonical duration, ignore client completion booleans, preserve completion once recorded, and require every published video resource to have a server-completed progress row before lesson completion.