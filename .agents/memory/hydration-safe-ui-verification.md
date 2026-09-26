---
name: Hydration-safe browser verification
description: Avoid false failures when testing client event handlers in Next.js development.
---

Next.js development pages can render controls from server HTML before client hydration attaches React event handlers. Native elements such as `<details>` can still toggle during this interval, making a page appear interactive while React-managed document handlers are not yet registered.

**Why:** The Profile outside-close check initially ran after the native menu appeared but before hydration; waiting for hydration made the same interaction pass. This distinction prevents test timing from being mistaken for a UI regression.

**How to apply:** When browser-testing event handlers, do not treat server-rendered element presence or native behavior as proof that React has hydrated. Wait for a React-owned interaction or a hydration-ready signal before testing delegated or outside-click behavior.