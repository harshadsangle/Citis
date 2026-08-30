# CITIS Education Platform foundation architecture

The platform is a multi-tenant SaaS monorepo. `services/api` is the NestJS REST
service, `apps/` contains role-specific portal boundaries, and `packages/`
contains contracts that must not depend on a feature module.

The existing public marketing application remains in
`citis-infotech/frontend` and is not imported by the platform service. Its
Skills Excellence Centre CTA enters the LMS foundation through `/lms`; the
existing Centre of Excellence marketing page remains available through the
Engagements navigation.

## Request flow

1. The API assigns a request ID and returns it in `X-Request-ID` and `meta`.
2. Authentication resolves an HTTP-only session to a user and tenant context.
3. Permission guards resolve database-backed role permissions.
4. Controllers validate DTOs and delegate to services.
5. Repositories/services include tenant scope in every business query.
6. Mutations write an audit record with before/after values and request metadata.

Controllers must not contain business rules or direct database queries. New
modules communicate through domain events rather than reading another module's
tables.

## Foundation boundary

Phase 0 covers identity, tenants, institutions, campuses, users, RBAC, module
activation metadata, API conventions, and audit logging. Course delivery and
the ERP modules described in later Blueprint phases are intentionally not
implemented here.