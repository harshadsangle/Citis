---
name: Hidden Course Builder programme
description: Defines how Course Builder preserves its required programme relationship without exposing it as user input.
---

Course Builder must never require, receive, or submit a programme selection in its client UI. The server must resolve an accessible published programme in an active institution from the authenticated Admin's tenant and scope. When the Admin portal is provider-scoped, it must pass only the provider slug so the server can select the matching programme.

**Why:** Programme is intentionally hidden from the Course Builder UI. Choosing the newest programme without preserving provider context can commit a published course successfully while both provider-scoped Admin and learner portals filter it out.

**How to apply:** Keep `programmeId` out of the Course Builder client contract. Validate any provider hint against the supported slugs, resolve the matching programme server-side, and recheck published/active tenant and institution scope inside the atomic transaction.