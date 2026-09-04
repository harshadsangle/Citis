---
name: Nullable scope uniqueness
description: PostgreSQL uniqueness behavior for user-role institution scopes with nullable campus values
---

When a scope table uses a nullable campus column, a unique constraint does not prevent multiple rows with the same user, role, and institution when campus is `NULL`. Idempotent seed or repair operations must explicitly remove or reconcile equivalent rows before inserting the canonical scope.

**Why:** PostgreSQL treats `NULL` values as distinct for ordinary unique constraints, so repeated demo-user seeding previously accumulated duplicate institution-level STUDENT assignments.

**How to apply:** For institution-level role scopes, explicitly normalize existing assignments in the transaction, then insert one canonical row with `campus_id = NULL`. Preserve unrelated roles and users.