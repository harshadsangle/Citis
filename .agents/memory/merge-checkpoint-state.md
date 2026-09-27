---
name: Merge checkpoint state
description: Verify Git state after Replit workspace handoffs during a merge.
---

After a workspace handoff, do not assume an uncommitted merge is still active. Recheck the current branch, HEAD, working tree, and `MERGE_HEAD` before resolving conflicts or retrying.

**Why:** During an in-progress local merge, conflict state disappeared between tool turns while local `main` advanced through empty agent commits. The cause was not clear, so a fresh state check prevented applying resolutions to a stale merge.

**How to apply:** Before each merge-resolution batch, inspect `git status`, `git rev-parse HEAD`, and `MERGE_HEAD`. If the refs changed, reassess the current branch tips and ancestry instead of continuing from old conflict output.