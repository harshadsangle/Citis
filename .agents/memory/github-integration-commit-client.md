---
name: GitHub integration commit client
description: Use the GitHub SDK client for Git object commits when proxyFetch rejects valid array fields.
---

For GitHub Git-data writes, prefer the authorized connection's SDK client methods such as `git.createTree`, `git.createCommit`, and `git.updateRef`. The connector's `proxyFetch` can create trees but may serialize commit arrays incorrectly and return a 422 error stating that an item is nil.

**Why:** A line-ending synchronization commit was rejected twice through `proxyFetch` even though the tree was valid; the SDK client created and updated the branch successfully.

**How to apply:** Fetch the current branch first, build the tree from that base, create the commit with explicit `parents`, and update `heads/main` without force unless a deliberate history rewrite is required.

When matching a connection from the Integrations view, compare its `connection:<id>` with `listConnections("github")`'s raw `id` after removing the `connection:` prefix.

**Why:** `listConnections()` returned the same GitHub connection ID without its type prefix, so direct string comparison incorrectly treated the authorized connection as unavailable.

**How to apply:** Keep the connection identifier inside the impure API call; log only non-credential metadata when debugging connection selection.

When transferring local Git blob content through `shellExec`, split base64 output into chunks smaller than about 60 KB, even when requesting a larger output limit. Larger outputs may be silently truncated without setting the returned `truncated` flag.

**Why:** A local blob's encoded output was truncated below its expected length despite a higher requested limit, which would corrupt a GitHub upload.

**How to apply:** Slice the base64 stream with `tail -c +N | head -c K`, reassemble it, check the encoded length, and locally verify the Git blob SHA before uploading; then verify GitHub's returned SHA too.