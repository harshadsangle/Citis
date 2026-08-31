ALTER TABLE lms_assessment_attempts
  ADD COLUMN IF NOT EXISTS grading_status text NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS grader_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS graded_at timestamptz,
  ADD COLUMN IF NOT EXISTS grading_feedback text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_grading_status_check') THEN
    ALTER TABLE lms_assessment_attempts
      ADD CONSTRAINT lms_assessment_attempts_grading_status_check
      CHECK (grading_status IN ('NOT_REQUIRED', 'PENDING', 'GRADED'));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_check') THEN
    ALTER TABLE lms_assessment_attempts DROP CONSTRAINT lms_assessment_attempts_check;
  END IF;
  ALTER TABLE lms_assessment_attempts
    ADD CONSTRAINT lms_assessment_attempts_check
    CHECK (
      (status = 'IN_PROGRESS' AND score IS NULL AND submitted_at IS NULL AND grading_status = 'NOT_REQUIRED')
      OR (
        status = 'SUBMITTED' AND score IS NOT NULL AND submitted_at IS NOT NULL
        AND (
          (grading_status = 'NOT_REQUIRED' AND grader_id IS NULL AND graded_at IS NULL)
          OR (grading_status = 'PENDING' AND grader_id IS NULL AND graded_at IS NULL)
          OR (grading_status = 'GRADED' AND grader_id IS NOT NULL AND graded_at IS NOT NULL)
        )
      )
    );
END $$;

CREATE INDEX IF NOT EXISTS lms_assessment_attempts_review_idx
  ON lms_assessment_attempts (tenant_id, institution_id, campus_id, assessment_id, status, grading_status, submitted_at DESC);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR', 'TEACHER')
  AND p.code = 'lms.assessment_attempt.update'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('009_lms_assessment_operations')
ON CONFLICT (version) DO NOTHING;