ALTER TABLE lms_assessments
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS due_at timestamptz;

CREATE TABLE IF NOT EXISTS lms_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  submission_text text NOT NULL,
  attachment_url text,
  is_late boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED')),
  grade numeric(10, 2) CHECK (grade IS NULL OR grade >= 0),
  feedback text,
  graded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'SUBMITTED' AND grade IS NULL AND graded_by IS NULL AND graded_at IS NULL)
    OR (status = 'GRADED' AND grade IS NOT NULL AND graded_by IS NOT NULL AND graded_at IS NOT NULL)),
  UNIQUE (tenant_id, assignment_id, learner_id)
);

CREATE INDEX IF NOT EXISTS lms_assignment_submissions_assignment_status_idx
  ON lms_assignment_submissions (tenant_id, institution_id, assignment_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS lms_assignment_submissions_learner_idx
  ON lms_assignment_submissions (tenant_id, institution_id, learner_id, submitted_at DESC);

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'assignment', 'VIEW', 'View LMS assignments'),
    ('lms', 'assignment', 'CREATE', 'Create LMS assignments'),
    ('lms', 'assignment', 'UPDATE', 'Update LMS assignments'),
    ('lms', 'assignment', 'PUBLISH', 'Publish LMS assignments'),
    ('lms', 'assignment', 'ARCHIVE', 'Archive LMS assignments'),
    ('lms', 'assignment_submission', 'VIEW', 'View LMS assignment submissions'),
    ('lms', 'assignment_submission', 'CREATE', 'Submit LMS assignments'),
    ('lms', 'assignment_submission', 'UPDATE', 'Grade LMS assignment submissions')
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
        'lms.assignment.view', 'lms.assignment.create', 'lms.assignment.update',
        'lms.assignment.publish', 'lms.assignment.archive',
        'lms.assignment_submission.view', 'lms.assignment_submission.update'
      )
    )
    OR (
      r.code = 'STUDENT'
      AND p.code IN ('lms.assignment.view', 'lms.assignment_submission.view', 'lms.assignment_submission.create', 'lms.assignment_submission.update')
    )
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('006_lms_assignments')
ON CONFLICT (version) DO NOTHING;