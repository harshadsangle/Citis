# LMS module boundary

The LMS is the learning-delivery module described by the CITIS Blueprint. The
current bounded delivery covers the course catalogue and builder hierarchy:
Programme → Course → Course Module → Lesson → Learning Resource.

Course-management records are tenant-scoped and support `DRAFT`, `PUBLISHED`,
and `ARCHIVED` status. Learning resources support `VIDEO`, `PDF`, `DOCUMENT`,
`PRESENTATION`, `LINK`, `SCORM`, and `INTERACTIVE` metadata. Every mutation is
written to the shared audit log, while the permission guard protects each
resource and action.

The institution-admin portal provides responsive hierarchy navigation, status
filters, create/edit forms, ordering controls, and publish/archive actions. It
uses the same-origin `/api/v1` path, which is proxied to the API service by the
portal in development and can be pointed at another API with `LMS_API_ORIGIN`.

The following intentionally remain future work: enrollment, cohorts, batches,
instructor allocation, assignments, assessments, progress, certificates,
learning analytics, file storage, SCORM execution, and external providers.

When LMS delivery is added, it must own its tables and expose module services;
other modules may consume its domain events but may not query its tables
directly.