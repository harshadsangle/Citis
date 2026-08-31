ALTER TABLE lms_assessment_attempts
  ADD COLUMN IF NOT EXISTS question_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_marks_snapshot numeric(10, 2),
  ADD COLUMN IF NOT EXISTS passing_marks_snapshot numeric(10, 2),
  ADD COLUMN IF NOT EXISTS duration_minutes_snapshot integer,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_status_check') THEN
    ALTER TABLE lms_assessment_attempts DROP CONSTRAINT lms_assessment_attempts_status_check;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_check') THEN
    ALTER TABLE lms_assessment_attempts DROP CONSTRAINT lms_assessment_attempts_check;
  END IF;
  ALTER TABLE lms_assessment_attempts
    ADD CONSTRAINT lms_assessment_attempts_status_check
    CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED'));
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
      OR (status = 'EXPIRED' AND score IS NULL AND submitted_at IS NULL AND grading_status = 'NOT_REQUIRED')
    );
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_scope_unique') THEN
    ALTER TABLE lms_assessment_attempts
      ADD CONSTRAINT lms_assessment_attempts_scope_unique
      UNIQUE (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lms_assessment_attempt_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  attempt_id uuid NOT NULL REFERENCES lms_assessment_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES lms_assessment_questions(id) ON DELETE RESTRICT,
  answer_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, attempt_id, question_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempt_drafts_attempt_scope_fk') THEN
    ALTER TABLE lms_assessment_attempt_drafts
      ADD CONSTRAINT lms_assessment_attempt_drafts_attempt_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, attempt_id)
      REFERENCES lms_assessment_attempts (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lms_assessment_attempt_drafts_attempt_idx
  ON lms_assessment_attempt_drafts (tenant_id, attempt_id, question_id);

INSERT INTO schema_migrations (version)
VALUES ('011_lms_assessment_attempt_stability')
ON CONFLICT (version) DO NOTHING;