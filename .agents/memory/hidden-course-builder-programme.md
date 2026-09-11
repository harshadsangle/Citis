---
name: Hidden Course Builder programme
description: Defines how Course Builder preserves its required programme relationship without exposing it as user input.
---

Course Builder must never require, receive, or submit a programme selection in its client UI. The server must resolve an existing accessible, non-archived programme from the authenticated Admin's tenant and institution scope.

**Why:** Programme is intentionally hidden from the Course Builder UI, so a missing internal identifier must not disable or invalidate an otherwise complete visible course.

**How to apply:** Keep Programme out of the Course Builder component contract and payload. Resolve it server-side, validate the tenant and institution relationship before creation, and recheck it inside the existing atomic transaction.