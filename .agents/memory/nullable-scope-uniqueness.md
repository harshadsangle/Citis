---
name: Nullable scope uniqueness
description: PostgreSQL uniqueness behavior for user-role institution scopes with nullable campus values
---

When a scope table uses nullable scope columns, a unique constraint does not prevent multiple rows with the same user, role, and scope when a column is `NULL`.

**Why:** PostgreSQL treats `NULL` values as distinct for ordinary unique constraints, so repeated demo-user seeding previously accumulated duplicate institution-level STUDENT assignments.

**How to apply:** For runtime assignment writes, lock the parent user row in the same transaction before the null-safe lookup and insert; the unique constraint alone cannot serialize equivalent nullable scopes. For seed or repair operations, reconcile equivalent rows before inserting the canonical scope, preserving unrelated roles and users.