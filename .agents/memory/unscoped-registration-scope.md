---
name: Unscoped staff registration visibility
description: Safe institution visibility for pending staff registrations that lack explicit institution scope.
---

Pending staff registrations without an institution assignment are tenant-level requests, not evidence that they belong to any particular institution. An institution administrator may see one only when the tenant has exactly one non-archived institution and the administrator's role scope points to it. Keep ordinary user lists and multi-institution tenants under strict scope checks; do not rewrite existing accounts or infer ownership from tenant membership alone.

**Why:** A request can have the correct tenant, status, and staff role while still lacking institution context. Treating tenant membership as institution authorization risks exposing applicant details across institutions.

**How to apply:** For an exceptional pending-staff view, require both a sole non-archived tenant institution and an actor scoped to that institution. When a tenant has multiple institutions, require explicit institution selection/assignment or a supported tenant-level review path instead of guessing.