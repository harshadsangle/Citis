---
name: GitHub API commit timezone
description: GitHub REST-created commits can serialize author and committer timestamps with the workspace timezone offset.
---

When reproducing a GitHub REST-created commit locally, use the exact timestamp offset encoded in the Git object, not only the UTC timestamp returned by the API.

**Why:** The API exposed the commit date in UTC, while the commit object used the workspace's `+05:30` offset; using `+0000` produced a different SHA for an otherwise identical tree, parent, author, committer, and message.

**How to apply:** Compare the full local commit object against the published SHA before moving refs, and preserve the previous local tip under a backup ref when aligning tracking branches.