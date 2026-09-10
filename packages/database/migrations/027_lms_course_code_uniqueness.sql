-- Course codes are generated for new Course Builder records and must be
-- unique across the tenant. Existing codes and course rows are unchanged.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_tenant_id_code_key'
      AND connamespace = current_schema()::regnamespace
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_tenant_id_code_key UNIQUE (tenant_id, code);
  END IF;
END $$;

INSERT INTO schema_migrations (version)
VALUES ('027_lms_course_code_uniqueness')
ON CONFLICT (version) DO NOTHING;