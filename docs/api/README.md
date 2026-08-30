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
- LMS course management: authenticated CRUD and publish/archive endpoints for
  `programmes`, `courses`, `course-modules`, `lessons`, and
  `learning-resources`. Child collections accept a parent ID filter such as
  `programmeId`, `courseId`, `moduleId`, or `lessonId`, plus the shared
  `status` filter.
- LMS course operations: authenticated, institution-scoped endpoints for
  `courses/:id/enrollments` and `courses/:id/instructor-assignments`, plus
  role-filtered candidate endpoints. These operations require a published
  course and preserve removed relationship history.

Use HTTP-only `citis_session` cookies for browser sessions. Bearer tokens are
accepted by the API guard for non-browser clients, but browser code must not
persist bearer tokens in local storage.

## LMS mutation rules

All LMS writes verify that the parent belongs to the authenticated tenant before
creating child content. Codes are unique within their parent scope, ordered
children use a unique positive sequence, and resource metadata is validated
against the selected resource type. Publish and archive actions are separate
permission-protected endpoints and are recorded as `PUBLISH` or `ARCHIVE`
audit actions.

Enrollment and instructor-assignment writes derive tenant and institution
ownership from the selected course, require an active Student or Teacher role
in that institution, and are recorded as `CREATE` or `REMOVE` audit actions.

## Learner progress

- `GET /api/v1/progress` returns the authenticated learner's active course
  summaries.
- `GET /api/v1/progress/courses/:courseId` returns course and module progress.
  Authorized institution staff may pass `learnerId` to inspect an enrolled
  learner in their institution or an actively assigned course.
- `POST /api/v1/progress/lessons/:lessonId/complete` records completion for
  the authenticated learner. Repeating the request is safe and does not create
  duplicate progress.
- `POST /api/v1/progress/assessment-completions` records a completed assessment
  attempt from the assessment result flow. The request accepts an assessment
  ID, attempt ID, optional score, pass state, and completion timestamp.

Progress counts only published lessons, published assessments, and active
enrollments. Lesson and assessment completion transitions are recorded in the
shared audit log. The progress migration also seeds separate read and
completion permissions; staff scope is checked server-side against the course
institution and instructor allocation.