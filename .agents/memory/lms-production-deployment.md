---
name: LMS production deployment
description: Release path for the public LMS catalogue.
---

GitHub main changes do not automatically update the public LMS production site. Production is served behind Nginx and requires a manual server deployment.

**Why:** Pushing the catalogue stylesheet to GitHub main left production `/lms` serving CSS without the LMS-specific palette. The response identified Nginx, and the repository has no public-site deployment workflow.

**How to apply:** After syncing catalogue changes to main, do not claim the live page is updated from the push alone. Follow the operator's manual server release process, then verify production `/lms` before reporting live completion.