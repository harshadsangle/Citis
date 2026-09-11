---
name: Hidden Course Builder programme
description: Defines how Course Builder preserves its required programme relationship without exposing it as user input.
---

Course Builder must never require a user to select or enter a programme. A supplied internal programme hint may be preserved, but when it is absent the server must resolve an accessible, non-archived programme in the authenticated tenant.

**Why:** Programme is intentionally hidden from the Course Builder UI, so a missing internal identifier must not disable or invalidate an otherwise complete visible course.

**How to apply:** Keep programme resolution tenant- and scope-aware, validate the resolved relationship before creation, and recheck it inside the existing atomic Course Builder transaction.