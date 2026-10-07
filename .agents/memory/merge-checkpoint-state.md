---
name: Merge checkpoint state
description: Verify Git state after Replit workspace handoffs during a merge.
---

After a workspace handoff, do not assume an uncommitted merge is still active. Recheck the current branch, HEAD, working tree, and `MERGE_HEAD` before resolving conflicts or retrying. Workspace automation may also materialize edits as a local commit on `main` with a `gitsafe-backup/*` ref; a mixed reset can be followed by automation recreating that commit.

**Why:** During an in-progress local merge, conflict state disappeared between tool turns while local `main` advanced through empty agent commits. In a later session, the workspace recreated a local safety commit after a mixed reset. Fresh ref checks prevented continuing from stale state or mistaking a local backup for a push.

**How to apply:** Before merge resolution or commit-sensitive work, inspect `git status`, `git rev-parse HEAD`, `MERGE_HEAD`, and refs containing HEAD. Compare against `origin/*` before reporting push status. Avoid repeated resets if workspace automation recreates a safety commit.