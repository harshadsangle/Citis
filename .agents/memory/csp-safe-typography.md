---
name: CSP-safe typography
description: Typography constraints for the LMS web surfaces
---

Remote Google Fonts stylesheet imports are blocked by the project’s Content Security Policy. Use the existing bundled font setup or a resilient local/system stack for new portal styling instead of CSS `@import` requests to external font hosts.

**Why:** External font imports produced browser CSP errors in the preview and would make the visual system depend on a request the deployed app does not permit.

**How to apply:** Keep new typography self-contained in the app’s font configuration or CSS fallbacks, and verify the browser console after visual changes.