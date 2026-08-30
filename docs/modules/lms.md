# LMS module boundary

The LMS is the learning-delivery module described by the CITIS Blueprint. This
foundation only establishes its activation metadata and a protected website
entry point at `/lms`.

The following intentionally remain future work: course catalog and builder,
programmes, modules, lessons, resources, assignments, assessments, enrollment,
cohorts, batches, instructor allocation, progress, certificates, and learning
analytics.

When LMS delivery is added, it must own its tables and expose module services;
other modules may consume its domain events but may not query its tables
directly.