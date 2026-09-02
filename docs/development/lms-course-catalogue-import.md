# CITIS LMS course catalogue import

The uploaded `Courses_to_be_uploaded_on_CITIS_LMS` DOCX is the source of truth for
the three catalogue programmes:

- Career Pathway Programs — 12 Professional Programs
- Specializations — 7 Specializations
- Certificate & Professional Certificate Programs — 58 certificate entries

Run the idempotent import with:

```bash
npm run db:import-citis-course-catalogue
```

The importer reads the DOCX directly, validates the expected 12/7/58 counts, and
publishes each programme, course, module, lesson, and source-document learning
resource. Re-running it updates the imported records in place and does not create
duplicates. The source document is copied into managed LMS storage for each
course's first lesson so administrators can open it from the LMS resource view.

For development verification, the importer also creates active enrollments for
`learner.demo@citis.in` when that account exists. Set
`SEED_DEMO_ENROLLMENTS=false` to skip those demo enrollments. Set
`CITIS_COURSE_CATALOGUE_PATH` to use a different source DOCX and
`INSTITUTION_ID` when more than one active institution exists.