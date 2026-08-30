CREATE TABLE IF NOT EXISTS lms_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  title text NOT NULL,
  assessment_type text NOT NULL CHECK (assessment_type IN ('PRACTICE_QUIZ', 'FORMATIVE', 'SUMMATIVE', 'ASSIGNMENT', 'PROJECT', 'VIVA', 'PRACTICAL')),
  total_marks numeric(10, 2) CHECK (total_marks IS NULL OR total_marks >= 0),
  passing_marks numeric(10, 2) CHECK (passing_marks IS NULL OR passing_marks >= 0),
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  attempt_limit integer CHECK (attempt_limit IS NULL OR attempt_limit >= 1),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lms_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'IN_PROGRESS' AND completed_at IS NULL) OR (status = 'COMPLETED' AND completed_at IS NOT NULL)),
  UNIQUE (tenant_id, course_id, lesson_id, learner_id)
);

CREATE TABLE IF NOT EXISTS lms_assessment_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  attempt_id text NOT NULL,
  score numeric(10, 2) CHECK (score IS NULL OR score >= 0),
  passed boolean,
  status text NOT NULL DEFAULT 'COMPLETED' CHECK (status = 'COMPLETED'),
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, assessment_id, learner_id, attempt_id)
);

CREATE INDEX IF NOT EXISTS lms_assessments_course_module_status_idx
  ON lms_assessments (tenant_id, institution_id, course_id, module_id, status, created_at);

CREATE INDEX IF NOT EXISTS lms_lesson_progress_learner_course_idx
  ON lms_lesson_progress (tenant_id, institution_id, learner_id, course_id, status);

CREATE INDEX IF NOT EXISTS lms_assessment_completions_learner_course_idx
  ON lms_assessment_completions (tenant_id, institution_id, learner_id, course_id, status);

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'course_progress', 'VIEW', 'View LMS course progress'),
    ('lms', 'lesson_progress', 'CREATE', 'Record LMS lesson completion'),
    ('lms', 'assessment_completion', 'VIEW', 'View LMS assessment completion'),
    ('lms', 'assessment_completion', 'CREATE', 'Record LMS assessment completion')
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
      r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR', 'TEACHER', 'STUDENT')
      AND p.code IN ('lms.course_progress.view', 'lms.assessment_completion.view')
    )
    OR (
      r.code = 'STUDENT'
      AND p.code IN ('lms.lesson_progress.create', 'lms.assessment_completion.create')
    )
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('005_lms_progress_tracking')
ON CONFLICT (version) DO NOTHING;