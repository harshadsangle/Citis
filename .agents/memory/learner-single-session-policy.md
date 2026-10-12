---
name: Learner single-session policy
description: The intended behavior when a learner signs in from another device or browser.
---

Allow a new learner login, but ensure only one server-valid learner session remains. The second login need not be rejected; it must invalidate the prior session. Tabs in one browser profile share a cookie jar, so they may both remain authenticated as the same replacement session.

**Why:** The user clarified that the requirement is one authenticated learner session at a time, not blocking a second login. Their manual check used two tabs in one browser, which share cookies and therefore do not represent two independent sessions.

**How to apply:** Verify takeover with separate browser profiles or devices. After the new login commits, the old profile's cookie must fail protected API validation; tabs sharing the new cookie may both pass because they are using one session.
