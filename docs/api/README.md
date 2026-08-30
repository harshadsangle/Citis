# Foundation API

The API is namespaced under `/api/v1`. OpenAPI documentation is served by the
API service at `/api/docs`.

## Response envelopes

Successful responses use:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

Errors use `success: false` with an `error.code`, human-readable `message`,
optional `details`, and the request ID in `meta`.

## Foundation endpoint groups

- `auth`: session login/logout/me, OTP contracts, and provider status.
- `tenants`: platform-scoped tenant management.
- `institutions`: tenant-scoped institution management.
- `campuses`: institution-scoped campus management.
- `users`: tenant-scoped users and role assignments.
- `roles` and `permissions`: database-backed RBAC.
- `modules` and `tenant-modules`: platform catalog and tenant activation.
- `audit-logs`: authorized, paginated mutation history.

Use HTTP-only `citis_session` cookies for browser sessions. Bearer tokens are
accepted by the API guard for non-browser clients, but browser code must not
persist bearer tokens in local storage.