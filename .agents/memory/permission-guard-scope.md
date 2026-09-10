---
name: Permission guard scope
description: The distinction between tenant-scoped LMS administrator roles and platform-wide permission bypasses.
---

Tenant-scoped LMS administrator roles must not automatically bypass every permission decorated route. Global bypasses belong only to explicitly platform-wide roles; institution and campus scope checks still need to apply to administrative capabilities.

**Why:** A shared `isLmsAdministrator` predicate used by the global permission guard and scope helpers can turn institution administrator roles into unrestricted access to unrelated tenant, RBAC, or platform endpoints, even when stored permissions do not grant those operations.

**How to apply:** Keep platform-role checks separate from LMS content-management role checks. Review every permission guard and `canAccessScope` caller when adding or renaming administrator role codes, and add tests for institution-admin denial of platform-only routes.