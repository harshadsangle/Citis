# Foundation database contract

The canonical development schema is the SQL migration in
`packages/database/migrations`. It is applied explicitly by the API migration
command and must not run during API startup.

All business identifiers are UUIDs. Tenant-scoped entities carry `tenant_id`
and use scoped constraints and indexes. Institutions and campuses carry both
their direct scope and their parent relationship. Platform-owned catalog tables
(`permissions` and `modules`) are not tenant data; activation records are
stored in `tenant_modules`. LMS content tables are tenant-scoped and retain
their parent IDs for the programme → course → module → lesson → resource
hierarchy.

Authentication support records (`auth_identities`, `auth_sessions`, and
`auth_challenges`) are intentionally separate from the `users` profile so
multiple provider strategies can be introduced without changing tenant
business records.

Production schema changes must use the supported publish-time database flow;
the API must never run DDL at startup or in a deployment hook.

The development migration runner applies `001_foundation.sql` and
`002_lms_course_management.sql` explicitly. Both scripts are idempotent and
record their version in `schema_migrations`; production schema changes remain
owned by the supported publish flow.