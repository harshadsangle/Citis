# @citis/database

This package owns the PostgreSQL schema contract for the CITIS Education Platform
foundation. Migrations are plain SQL so the schema remains reviewable and
portable across local, Replit, and deployment environments.

The API runs migrations explicitly through `npm run db:migrate`; schema changes
must not run automatically during application startup. LMS enrollment and
instructor-assignment tables are owned by the LMS module and are added through
the same explicit migration sequence.