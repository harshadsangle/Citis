ALTER TABLE lms_assessments
  ADD COLUMN IF NOT EXISTS description text;

CREATE TABLE IF NOT EXISTS lms_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  prompt text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT', 'NUMERIC')),
  marks numeric(10, 2) NOT NULL CHECK (marks > 0),
  sequence integer NOT NULL CHECK (sequence > 0),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, assessment_id, sequence)
);

CREATE TABLE IF NOT EXISTS lms_assessment_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  question_id uuid NOT NULL REFERENCES lms_assessment_questions(id) ON DELETE CASCADE,
  option_value text NOT NULL,
  option_label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sequence integer NOT NULL CHECK (sequence > 0),
  UNIQUE (tenant_id, question_id, sequence),
  UNIQUE (tenant_id, question_id, option_value)
);

CREATE TABLE IF NOT EXISTS lms_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED')),
  score numeric(10, 2) CHECK (score IS NULL OR score >= 0),
  max_score numeric(10, 2) CHECK (max_score IS NULL OR max_score >= 0),
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'IN_PROGRESS' AND score IS NULL AND submitted_at IS NULL)
    OR (status = 'SUBMITTED' AND score IS NOT NULL AND submitted_at IS NOT NULL)),
  UNIQUE (tenant_id, assessment_id, learner_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS lms_assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  attempt_id uuid NOT NULL REFERENCES lms_assessment_attempts(id) ON DELETE RESTRICT,
  question_id uuid NOT NULL REFERENCES lms_assessment_questions(id) ON DELETE RESTRICT,
  answer_json jsonb NOT NULL,
  is_correct boolean,
  awarded_marks numeric(10, 2) NOT NULL CHECK (awarded_marks >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS lms_assessment_questions_scope_idx
  ON lms_assessment_questions (tenant_id, institution_id, campus_id, assessment_id, status, sequence);
CREATE INDEX IF NOT EXISTS lms_assessment_options_question_idx
  ON lms_assessment_options (tenant_id, question_id, sequence);
CREATE INDEX IF NOT EXISTS lms_assessment_attempts_learner_idx
  ON lms_assessment_attempts (tenant_id, institution_id, campus_id, learner_id, assessment_id, status);
CREATE INDEX IF NOT EXISTS lms_assessment_answers_attempt_idx
  ON lms_assessment_answers (tenant_id, institution_id, campus_id, attempt_id, question_id);

CREATE UNIQUE INDEX IF NOT EXISTS lms_assessments_scope_id_key
  ON lms_assessments (tenant_id, institution_id, campus_id, course_id, module_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS lms_assessment_questions_scope_id_key
  ON lms_assessment_questions (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS lms_assessment_attempts_scope_id_key
  ON lms_assessment_attempts (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS courses_tenant_institution_id_campus_key
  ON courses (tenant_id, institution_id, id, campus_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_questions_assessment_scope_fk') THEN
    ALTER TABLE lms_assessment_questions
      ADD CONSTRAINT lms_assessment_questions_assessment_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id)
      REFERENCES lms_assessments (tenant_id, institution_id, campus_id, course_id, module_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_options_question_scope_fk') THEN
    ALTER TABLE lms_assessment_options
      ADD CONSTRAINT lms_assessment_options_question_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id)
      REFERENCES lms_assessment_questions (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_attempts_assessment_scope_fk') THEN
    ALTER TABLE lms_assessment_attempts
      ADD CONSTRAINT lms_assessment_attempts_assessment_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id)
      REFERENCES lms_assessments (tenant_id, institution_id, campus_id, course_id, module_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_answers_attempt_scope_fk') THEN
    ALTER TABLE lms_assessment_answers
      ADD CONSTRAINT lms_assessment_answers_attempt_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, attempt_id)
      REFERENCES lms_assessment_attempts (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_answers_question_scope_fk') THEN
    ALTER TABLE lms_assessment_answers
      ADD CONSTRAINT lms_assessment_answers_question_scope_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id)
      REFERENCES lms_assessment_questions (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, id);
  END IF;
END $$;

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'assessment', 'VIEW', 'View LMS assessments'),
    ('lms', 'assessment', 'CREATE', 'Create LMS assessments'),
    ('lms', 'assessment', 'UPDATE', 'Update LMS assessments'),
    ('lms', 'assessment', 'PUBLISH', 'Publish LMS assessments'),
    ('lms', 'assessment', 'ARCHIVE', 'Archive LMS assessments'),
    ('lms', 'assessment_question', 'VIEW', 'View LMS assessment questions'),
    ('lms', 'assessment_question', 'CREATE', 'Create LMS assessment questions'),
    ('lms', 'assessment_question', 'UPDATE', 'Update LMS assessment questions'),
    ('lms', 'assessment_question', 'ARCHIVE', 'Archive LMS assessment questions'),
    ('lms', 'assessment_option', 'CREATE', 'Create LMS assessment options'),
    ('lms', 'assessment_option', 'UPDATE', 'Update LMS assessment options'),
    ('lms', 'assessment_option', 'ARCHIVE', 'Archive LMS assessment options'),
    ('lms', 'assessment_attempt', 'VIEW', 'View LMS assessment attempts'),
    ('lms', 'assessment_attempt', 'CREATE', 'Start LMS assessment attempts'),
    ('lms', 'assessment_attempt', 'UPDATE', 'Submit LMS assessment attempts')
)
INSERT INTO permissions (module, resource, action, code, description)
SELECT module, resource, action, module || '.' || resource || '.' || lower(action), description
FROM permission_seed
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND (
    (
      r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR', 'TEACHER')
      AND p.code IN (
        'lms.assessment.view', 'lms.assessment.create', 'lms.assessment.update',
        'lms.assessment.publish', 'lms.assessment.archive',
        'lms.assessment_question.view', 'lms.assessment_question.create',
        'lms.assessment_question.update', 'lms.assessment_question.archive',
        'lms.assessment_option.create', 'lms.assessment_option.update', 'lms.assessment_option.archive',
        'lms.assessment_attempt.view'
      )
    )
    OR (
      r.code = 'STUDENT'
      AND p.code IN ('lms.assessment.view', 'lms.assessment_question.view', 'lms.assessment_attempt.view', 'lms.assessment_attempt.create', 'lms.assessment_attempt.update')
    )
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('008_lms_assessment_engine')
ON CONFLICT (version) DO NOTHING;