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

Published courses can now have institution-scoped learner enrollments and
instructor allocations. Only active users with the Student or Teacher role in
the course institution can be selected, and relationship create/remove
mutations are written to the shared audit log.

Learner progress is derived from the published course structure. Completing a
published lesson records an idempotent lesson completion, and a server-scored
assessment attempt records the learner's answers, score, and pass state.
Course and module summaries include completed lessons and assessments and expose
`NOT_STARTED`, `IN_PROGRESS`, or `COMPLETED` states. Learners can view only
their own active enrollments; authorized institution staff can view enrolled
learners only within their institution and assigned courses.

Assessment authoring supports practice quizzes, formative and summative checks,
assignments, projects, vivas, and practicals. Questions support single choice,
multiple choice, true/false, short text, and numeric answers. Correct options
are never returned to learners, objective scoring happens on the server, an
attempt limit is enforced, and submitted attempts cannot be edited or scored
again. The existing assignment submission and instructor-grading flow remains
the authoritative completion path for assignment work.

The following intentionally remain future work: cohorts, batches, certificates,
learning analytics, and external providers.

Future LMS capabilities must continue to own their tables and expose module
services; other modules may consume its domain events but may not query LMS
tables directly.