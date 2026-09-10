---
name: Tenant-parent integrity constraints
description: Schema-local migration behavior for composite LMS hierarchy constraints.
---

Composite LMS foreign-key migrations must check constraint existence within the active schema, not only by constraint name. Test schemas share the database catalog with public, so an unqualified pg_constraint name check can skip creating a required constraint in an isolated schema.

**Why:** The integrity migration initially passed against the public schema but allowed cross-tenant inserts in a newly created test schema when the same constraint name already existed elsewhere.

**How to apply:** Scope pg_constraint existence checks by `connamespace = current_schema()::regnamespace` whenever migrations are expected to run under alternate search paths.