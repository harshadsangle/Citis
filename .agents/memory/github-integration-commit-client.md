---
name: GitHub integration commit client
description: Use the GitHub SDK client for Git object commits when proxyFetch rejects valid array fields.
---

For GitHub Git-data writes, prefer the authorized connection's SDK client methods such as `git.createTree`, `git.createCommit`, and `git.updateRef`. The connector's `proxyFetch` can create trees but may serialize commit arrays incorrectly and return a 422 error stating that an item is nil.

**Why:** A line-ending synchronization commit was rejected twice through `proxyFetch` even though the tree was valid; the SDK client created and updated the branch successfully.

**How to apply:** Fetch the current branch first, build the tree from that base, create the commit with explicit `parents`, and update `heads/main` without force unless a deliberate history rewrite is required.