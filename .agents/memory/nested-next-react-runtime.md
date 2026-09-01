---
name: Nested Next React runtime
description: The standalone public Next app has its own dependency install and needs a single React runtime for Turbopack hook consumers.
---

The nested public Next app must resolve `react` and `react-dom` through its local installation so hook libraries and the renderer share one runtime instance.

**Why:** The repository also installs React for the portal apps; allowing Turbopack to resolve across those package boundaries caused the shared login form to emit an invalid hook call despite matching React version numbers.

**How to apply:** Preserve the public app's Turbopack React aliases when changing its package layout, bundler root, or dependency installation.